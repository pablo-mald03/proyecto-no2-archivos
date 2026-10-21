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
import { EmptyTrashResponseDto, TrashItemDto } from '../dto/response/trash-item.dto';
import { FileNotFoundException } from 'src/files/exceptions/file-not-found.exception';
import { FolderNotFoundException } from 'src/folders/exceptions/folder-not-found.exception';
import { AccessDeniedException } from 'src/common/exceptions/access-deniend.exception';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { ListTrashQueryDto } from '../dto/request/list-trash-query.dto';

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
   * Method to list all root deleted items for the user's trash view with pagination and filters
   */
  async listTrash(actor: AuthUser, query: ListTrashQueryDto): Promise<PageResponseDto<TrashItemDto>> {
    const shouldFetchFolders = query.type === 'ALL' || query.type === 'FOLDERS_ONLY';
    const shouldFetchFiles = query.type === 'ALL' || query.type === 'FILES_ONLY';

    const [trashFolders, trashFiles] = await Promise.all([
      shouldFetchFolders && !query.extension ? this.foldersRepository.findTrashRoots(actor.id) : Promise.resolve([]),
      shouldFetchFiles ? this.filesRepository.findTrashRoots(actor.id) : Promise.resolve([]),
    ]);

    const matchingItems: TrashItemDto[] = [];

    for (const f of trashFolders) {
      if (query.search && !f.name.toLowerCase().includes(query.search.toLowerCase())) continue;
      const deletedAt = f.deletedAt || f.updatedAt;
      if (query.from && deletedAt < query.from) continue;
      if (query.to && deletedAt > query.to) continue;

      matchingItems.push({
        id: f._id.toString(),
        name: f.name,
        type: 'FOLDER',
        trashBatchId: f.trashBatchId ? f.trashBatchId.toString() : f._id.toString(),
        deletedAt: deletedAt ? deletedAt.toISOString() : new Date().toISOString(),
      });
    }

    for (const f of trashFiles) {
      if (query.extension && f.extension !== query.extension) continue;
      if (query.search && !f.name.toLowerCase().includes(query.search.toLowerCase())) continue;
      const deletedAt = f.deletedAt || f.updatedAt;
      if (query.from && deletedAt < query.from) continue;
      if (query.to && deletedAt > query.to) continue;

      matchingItems.push({
        id: f._id.toString(),
        name: f.name,
        type: 'FILE',
        trashBatchId: f.trashBatchId ? f.trashBatchId.toString() : f._id.toString(),
        deletedAt: deletedAt ? deletedAt.toISOString() : new Date().toISOString(),
        sizeBytes: f.sizeBytes,
        extension: f.extension,
      });
    }

    // Sort items
    matchingItems.sort((a, b) => {
      let comparison = 0;
      switch (query.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sizeBytes':
          comparison = (a.sizeBytes || 0) - (b.sizeBytes || 0);
          break;
        case 'deletedAt':
        default:
          comparison = new Date(a.deletedAt).getTime() - new Date(b.deletedAt).getTime();
          break;
      }
      return query.direction === 'asc' ? comparison : -comparison;
    });

    const total = matchingItems.length;
    const start = query.page * query.size;
    const content = matchingItems.slice(start, start + query.size);

    return PageResponseDto.of(content, total, query);
  }

  /**
   * Method to move a file or folder into trash (cascade batch for folders)
   */
  async moveToTrash(resourceType: 'FILE' | 'FOLDER', resourceId: string, actor: AuthUser): Promise<void> {
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
        description: `Envio el archivo "${file.name}" a la papelera`,
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
            description: `Envio la carpeta "${folder.name}" a la papelera`,
            resource: { type: ResourceType.FOLDER, id: folder._id.toString(), name: folder.name },
          },
          session,
        );
      });
    }
  }

  /**
   * Method to restore a batch of files/folders from trash
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
      for (const folder of batchFolders) {
        if (folder.parentId) {
          const parentFolder = await this.foldersRepository.findActiveById(folder.parentId, session);
          if (!parentFolder) {
            await this.foldersRepository.updateFolderParentAndAncestors(folder._id, null, [], session);
          }
        }
      }

      await this.foldersRepository.restoreByTrashBatch(batchOid, session);
      await this.filesRepository.restoreByTrashBatch(batchOid, session);

      const rootItemName =
        batchFolders.find((f) => f.isTrashRoot)?.name ||
        batchFiles.find((f) => f.isTrashRoot)?.name ||
        'Lote';

      await this.activity.recordAndWait(
        {
          actor: { id: actor.id, username: actor.username, email: actor.email },
          action: batchFolders.length > 0 ? ActivityAction.FOLDER_RESTORED : ActivityAction.FILE_RESTORED,
          description: `Restauro "${rootItemName}" de la papelera`,
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
   * Method to permanently delete a trash batch: deletes documents, binaries from GridFS, shares, and discounts quota
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
      for (const f of batchFolders) {
        await this.sharesRepository.deleteByResource('FOLDER', f._id, session);
      }
      for (const f of batchFiles) {
        await this.sharesRepository.deleteByResource('FILE', f._id, session);
      }

      await this.foldersRepository.deletePermanentlyByBatch(batchOid, session);
      await this.filesRepository.deletePermanentlyByBatch(batchOid, session);

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
          description: `Elimino definitivamente "${rootName}" (${totalBytesToRelease} bytes liberados)`,
          resource: {
            type: batchFolders.length > 0 ? ResourceType.FOLDER : ResourceType.FILE,
            id: batchOid.toString(),
            name: rootName,
          },
        },
        session,
      );
    });

    for (const gridFsId of gridFsIdsToDelete) {
      await this.gridFsStorage.deleteFile(gridFsId).catch(() => { });
    }
  }

  /**
   * Method to permanently delete ALL trashed items for current user (empty trash)
   */
  async emptyTrash(actor: AuthUser): Promise<EmptyTrashResponseDto> {
    const ownerOid = new Types.ObjectId(actor.id);

    const [deletedFolders, deletedFiles] = await Promise.all([
      this.foldersRepository.findAllDeletedByOwner(ownerOid),
      this.filesRepository.findAllDeletedByOwner(ownerOid),
    ]);

    if (!deletedFolders.length && !deletedFiles.length) {
      return { deletedFoldersCount: 0, deletedFilesCount: 0, bytesReleased: 0 };
    }

    const folderIds = deletedFolders.map((f) => f._id);
    const fileIds = deletedFiles.map((f) => f._id);
    const totalBytesToRelease = deletedFiles.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);
    const gridFsIdsToDelete = deletedFiles.map((f) => f.gridFsId);

    await this.connection.transaction(async (session) => {
      if (folderIds.length > 0) {
        await this.sharesRepository.deleteByResourceIds('FOLDER', folderIds, session);
      }
      if (fileIds.length > 0) {
        await this.sharesRepository.deleteByResourceIds('FILE', fileIds, session);
      }

      await this.foldersRepository.deleteAllPermanentlyByOwner(ownerOid, session);
      await this.filesRepository.deleteAllPermanentlyByOwner(ownerOid, session);

      if (totalBytesToRelease > 0) {
        await this.usersRepository.releaseStorageQuota(ownerOid, totalBytesToRelease, session);
      }

      await this.activity.recordAndWait(
        {
          actor: { id: actor.id, username: actor.username, email: actor.email },
          action: ActivityAction.FILE_DELETED_PERMANENTLY,
          description: `Vació la papelera (${deletedFolders.length} carpetas y ${deletedFiles.length} archivos eliminados, ${totalBytesToRelease} bytes liberados)`,
          resource: {
            type: ResourceType.FILE,
            id: actor.id,
            name: 'Papelera',
          },
          metadata: totalBytesToRelease > 0 ? { sizeBytes: totalBytesToRelease } : undefined,
        },
        session,
      );
    });

    for (const gridFsId of gridFsIdsToDelete) {
      await this.gridFsStorage.deleteFile(gridFsId).catch(() => { });
    }

    return {
      deletedFoldersCount: deletedFolders.length,
      deletedFilesCount: deletedFiles.length,
      bytesReleased: totalBytesToRelease,
    };
  }
}
