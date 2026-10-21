import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FoldersRepository } from '../repository/folders.repository';
import { FolderNotFoundException } from '../exceptions/folder-not-found.exception';
import { FolderCycleException } from '../exceptions/folder-cycle.exception';
import { FolderDocument } from '../entities/folder.entity';
import { FolderBreadcrumbDto } from '../dto/response/folder-breadcrum-response.dto';

/* Principal helper service for folder hierarchy operations */
@Injectable()
export class FolderHierarchyHelperService {
  constructor(private readonly foldersRepository: FoldersRepository) { }

  /**
   * Principal method to build the breadcrumb list for a folder going up to the root
   */
  async buildBreadcrumbs(currentFolder: FolderDocument): Promise<FolderBreadcrumbDto[]> {
    const breadcrumbs: FolderBreadcrumbDto[] = [];

    if (currentFolder.ancestors.length > 0) {
      const ancestorDocs = await this.foldersRepository.findByIds(currentFolder.ancestors);
      const map = new Map(ancestorDocs.map((doc) => [doc._id.toString(), doc.name]));
      for (const ancId of currentFolder.ancestors) {
        breadcrumbs.push({
          id: ancId.toString(),
          name: map.get(ancId.toString()) || '',
        });
      }
    }

    breadcrumbs.push({
      id: currentFolder._id.toString(),
      name: currentFolder.name,
    });

    return breadcrumbs;
  }

  /**
   * Principal method to validate the target folder for move operation, prevents cycles
   */
  async validateMoveTarget(
    folderId: Types.ObjectId,
    targetParentId: Types.ObjectId | null,
    actorId: string,
  ): Promise<Types.ObjectId[]> {
    if (!targetParentId) {
      return [];
    }

    if (folderId.equals(targetParentId)) {
      throw new FolderCycleException('No se puede mover una carpeta dentro de si misma');
    }

    const targetParent = await this.foldersRepository.findActiveById(targetParentId);
    if (!targetParent) {
      throw new FolderNotFoundException(targetParentId.toString());
    }

    if (targetParent.ownerId.toString() !== actorId) {
      throw new FolderNotFoundException(targetParentId.toString());
    }

    const isDescendant = targetParent.ancestors.some((ancId) => ancId.equals(folderId));
    if (isDescendant) {
      throw new FolderCycleException('No se puede mover una carpeta a una subcarpeta descendiente');
    }

    return [...targetParent.ancestors, targetParent._id];
  }
}
