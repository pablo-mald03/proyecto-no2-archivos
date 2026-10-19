import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FoldersRepository } from 'src/folders/repository/folders.repository';
import { AccessResolverService } from 'src/sharing/service/access-resolver.service';
import { AccessLevel } from 'src/common/constants/permissions/access-level';
import { FolderNotFoundException } from 'src/folders/exceptions/folder-not-found.exception';
import { FileDocument } from '../entities/file.entity';

//Principal file access helper service class
@Injectable()
export class FileAccessHelperService {
  constructor(
    private readonly foldersRepository: FoldersRepository,
    private readonly accessResolver: AccessResolverService,
  ) { }

  /**
   * Principal Method to resolves the full chain of folder ancestors
   */
  async resolveFolderAncestors(folderId: Types.ObjectId | null): Promise<Types.ObjectId[]> {
    if (!folderId) {
      return [];
    }
    const folder = await this.foldersRepository.findActiveById(folderId);
    if (!folder) {
      return [folderId];
    }
    return [...folder.ancestors, folder._id];
  }

  /**
   * Principal Method for user access on a file given its document and permissions required
   */
  async assertFileAccess(file: FileDocument, userId: string, minRequiredLevel: AccessLevel = AccessLevel.VIEWER,): Promise<void> {
    const ancestors = await this.resolveFolderAncestors(file.folderId);
    await this.accessResolver.assertAccess(
      {
        type: 'FILE',
        id: file._id,
        ownerId: file.ownerId,
        ancestors,
      },
      userId,
      minRequiredLevel,
    );
  }

  /**
   * Principal method to assert user permissions to upload files inside destination folder
   */
  async assertDestinationFolderUploadAccess(folderId: string | null, userId: string,
  ): Promise<{ targetFolderOid: Types.ObjectId | null; quotaOwnerId: Types.ObjectId }> {
    if (!folderId) {
      return {
        targetFolderOid: null,
        quotaOwnerId: new Types.ObjectId(userId),
      };
    }

    const folder = await this.foldersRepository.findActiveById(folderId);
    if (!folder) {
      throw new FolderNotFoundException(folderId);
    }

    await this.accessResolver.assertAccess(
      {
        type: 'FOLDER',
        id: folder._id,
        ownerId: folder.ownerId,
        ancestors: folder.ancestors,
      },
      userId,
      AccessLevel.EDITOR,
      'No tienes permisos de edición en esta carpeta para subir archivos',
    );

    return {
      targetFolderOid: folder._id,
      quotaOwnerId: folder.ownerId,
    };
  }

  /**
   * Principal method for the actor to be the owner of the resource
   */
  assertOwner(ownerId: Types.ObjectId | string, userId: string): void {
    this.accessResolver.assertOwner(ownerId, userId);
  }
}
