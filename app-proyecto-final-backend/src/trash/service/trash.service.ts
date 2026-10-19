import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { FoldersRepository } from 'src/folders/repository/folders.repository';
import { FilesRepository } from 'src/files/repository/files.repository';
import { GridFsStorageService } from 'src/files/service/grid-fs-storage.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { SharesRepository } from 'src/sharing/repository/shares.repository';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { AuthUser } from 'src/users/models/auth-user.model';
import { TrashItemDto } from '../dto/response/trash-item.dto';
import { FileNotFoundException } from 'src/files/exceptions/file-not-found.exception';
import { FolderNotFoundException } from 'src/folders/exceptions/folder-not-found.exception';
import { AccessDeniedException } from 'src/common/exceptions/access-deniend.exception';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';

/*Principal trash service class*/
@Injectable()
export class TrashService {
  constructor(
    private readonly foldersRepository: FoldersRepository,
    private readonly filesRepository: FilesRepository,
    private readonly gridFsStorage: GridFsStorageService,
    private readonly usersRepository: UsersRepository,
    private readonly sharesRepository: SharesRepository,
    private readonly activity: ActivityRecorderService,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  /**
   * List all root deleted items for the user's trash view
   */
  async listTrash(actor: AuthUser): Promise<TrashItemDto[]> {
    const [trashFolders, trashFiles] = await Promise.all([
      this.foldersRepository.findTrashRoots(actor.id),
      this.filesRepository.findTrashRoots(actor.id),
    ]);

    const items: TrashItemDto[] = [
      ...trashFolders.map((f) => ({
        id: f._id.toString(),
        name: f.name,
        type: 'FOLDER' as const,
        trashBatchId: f.trashBatchId ? f.trashBatchId.toString() : f._id.toString(),
        deletedAt: f.deletedAt ? f.deletedAt.toISOString() : f.updatedAt.toISOString(),
      })),
      ...trashFiles.map((f) => ({
        id: f._id.toString(),
        name: f.name,
        type: 'FILE' as const,
        trashBatchId: f.trashBatchId ? f.trashBatchId.toString() : f._id.toString(),
        deletedAt: f.deletedAt ? f.deletedAt.toISOString() : f.updatedAt.toISOString(),
        sizeBytes: f.sizeBytes,
        extension: f.extension,
      })),
    ];

    return items.sort((a, b) => (a.deletedAt > b.deletedAt ? -1 : 1));
  }

  /**
   * Move a file or folder into trash (cascade batch for folders)
   */
  async moveToTrash(
    resourceType: 'FILE' | 'FOLDER',
    resourceId: string,
    actor: AuthUser,
  ): Promise<void> {
    const actorOid = new Types.ObjectId(actor.id);
    const trashBatchId = new Types.ObjectId();

    if (resourceType === 'FILE') {
      const file = await this.filesRepository.findActiveById(resourceId);
      if (!file) throw new FileNotFoundException(resourceId);
      if (file.ownerId.toString() !== actor.id) {
        throw new AccessDeniedException('Solo el propietario puede enviar este archivo a la papelera');
      }

      await this.filesRepository.moveToTrash(file._id, trashBatchId, actorOid);

      this.activity.record({
        actor: { id: actor.id, username: actor.username, email: actor.email },
        action: ActivityAction.FILE_TRASHED,
        description: `Envió el archivo "${file.name}" a la papelera`,
        resource: { type: ResourceType.FILE, id: file._id.toString(), name: file.name },
      });
    } else {
      const folder = await this.foldersRepository.findActiveById(resourceId);
      if (!folder) throw new FolderNotFoundException(resourceId);
      if (folder.ownerId.toString() !== actor.id) {
        throw new AccessDeniedException('Solo el propietario puede enviar esta carpeta a la papelera');
      }

      await this.connection.transaction(async (session) => {
        const descendants = await this.foldersRepository.findDescendants(folder._id, session);
        const allFolderIds = [folder._id, ...descendants.map((d) => d._id)];

        await this.foldersRepository.moveToTrash(
          folder._id,
          descendants.map((d) => d._id),
          trashBatchId,
          actorOid,
          session,
        );

        await this.filesRepository.moveByFolderIdsToTrash(
          allFolderIds,
          trashBatchId,
          actorOid,
          session,
        );

        await this.activity.recordAndWait(
          {
            actor: { id: actor.id, username: actor.username, email: actor.email },
            action: ActivityAction.FOLDER_TRASHED,
            description: `Envió la carpeta "${folder.name}" a la papelera`,
            resource: { type: ResourceType.FOLDER, id: folder._id.toString(), name: folder.name },
          },
          session,
        );
      });
    }
  }

  /**
   * Restore a batch of files/folders from trash
   */
  async restoreFromTrash(trashBatchId: string, actor: AuthUser): Promise<void> {
    const batchOid = new Types.ObjectId(trashBatchId);

    const [batchFolders, batchFiles] = await Promise.all([
      this.foldersRepository.findByTrashBatch(batchOid),
      this.filesRepository.findByTrashBatch(batchOid),
    ]);

    if (!batchFolders.length && !batchFiles.length) {
      return;
    }

    const firstOwnerId = batchFolders[0]?.ownerId || batchFiles[0]?.ownerId;
    if (firstOwnerId && firstOwnerId.toString() !== actor.id) {
      throw new AccessDeniedException('No tienes permisos para restaurar estos elementos');
    }

    await this.connection.transaction(async (session) => {
      // 1. Restore folder parent links to root if original parent was deleted
      for (const folder of batchFolders) {
        if (folder.parentId) {
          const parentFolder = await this.foldersRepository.findActiveById(folder.parentId, session);
          if (!parentFolder) {
            await this.foldersRepository.updateFolderParentAndAncestors(folder._id, null, [], session);
          }
        }
      }

      // 2. Unmark deletion flags
      await this.foldersRepository.restoreByTrashBatch(batchOid, session);
      await this.filesRepository.restoreByTrashBatch(batchOid, session);

      // 3. Log restoration
      const rootItemName =
        batchFolders.find((f) => f.isTrashRoot)?.name ||
        batchFiles.find((f) => f.isTrashRoot)?.name ||
        'Lote';

      await this.activity.recordAndWait(
        {
          actor: { id: actor.id, username: actor.username, email: actor.email },
          action: batchFolders.length > 0 ? ActivityAction.FOLDER_RESTORED : ActivityAction.FILE_RESTORED,
          description: `Restauró "${rootItemName}" de la papelera`,
          resource: {
            type: batchFolders.length > 0 ? ResourceType.FOLDER : ResourceType.FILE,
            id: batchOid.toString(),
            name: rootItemName,
          },
        },
        session,
      );
    });
  }

  /**
   * Permanently delete a trash batch: deletes documents, binaries from GridFS, shares, and discounts quota
   */
  async deletePermanently(trashBatchId: string, actor: AuthUser): Promise<void> {
    const batchOid = new Types.ObjectId(trashBatchId);

    const [batchFolders, batchFiles] = await Promise.all([
      this.foldersRepository.findByTrashBatch(batchOid),
      this.filesRepository.findByTrashBatch(batchOid),
    ]);

    if (!batchFolders.length && !batchFiles.length) {
      return;
    }

    const ownerId = batchFolders[0]?.ownerId || batchFiles[0]?.ownerId;
    if (ownerId && ownerId.toString() !== actor.id) {
      throw new AccessDeniedException('No tienes permisos para eliminar definitivamente estos elementos');
    }

    const totalBytesToRelease = batchFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
    const gridFsIdsToDelete = batchFiles.map((f) => f.gridFsId);

    await this.connection.transaction(async (session) => {
      // Delete shares associated with deleted items
      for (const f of batchFolders) {
        await this.sharesRepository.deleteByResource('FOLDER', f._id, session);
      }
      for (const f of batchFiles) {
        await this.sharesRepository.deleteByResource('FILE', f._id, session);
      }

      // Delete database documents
      await this.foldersRepository.deletePermanentlyByBatch(batchOid, session);
      await this.filesRepository.deletePermanentlyByBatch(batchOid, session);

      // Release quota
      if (totalBytesToRelease > 0) {
        await this.usersRepository.releaseStorageQuota(ownerId, totalBytesToRelease, session);
      }

      const rootName =
        batchFolders.find((f) => f.isTrashRoot)?.name ||
        batchFiles.find((f) => f.isTrashRoot)?.name ||
        'Lote';

      await this.activity.recordAndWait(
        {
          actor: { id: actor.id, username: actor.username, email: actor.email },
          action:
            batchFolders.length > 0
              ? ActivityAction.FOLDER_DELETED_PERMANENTLY
              : ActivityAction.FILE_DELETED_PERMANENTLY,
          description: `Eliminó definitivamente "${rootName}" (${totalBytesToRelease} bytes liberados)`,
          resource: {
            type: batchFolders.length > 0 ? ResourceType.FOLDER : ResourceType.FILE,
            id: batchOid.toString(),
            name: rootName,
          },
        },
        session,
      );
    });

    // Delete binaries from GridFS
    for (const gridFsId of gridFsIdsToDelete) {
      await this.gridFsStorage.deleteFile(gridFsId).catch(() => { });
    }
  }
}
