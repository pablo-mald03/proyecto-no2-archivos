import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { FoldersRepository } from '../repository/folders.repository';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { AuthUser } from 'src/users/models/auth-user.model';
import { CreateFolderDto } from '../dto/request/create-folder.dto';
import { RenameFolderDto } from '../dto/request/rename-folder.dto';
import { MoveFolderDto } from '../dto/request/move-folder.dto';
import { FolderResponseDto } from '../dto/response/folder-response.dto';
import { FolderBreadcrumbDto, FolderContentResponseDto } from '../dto/response/folder-content-response.dto';
import { FolderMapper } from '../mapper/folder.mapper';
import { FolderNotFoundException } from '../exceptions/folder-not-found.exception';
import { FolderNameConflictException } from '../exceptions/folder-name-conflict.exception';
import { FolderCycleException } from '../exceptions/folder-cycle.exception';
import { AccessDeniedException } from 'src/common/exceptions/access-deniend.exception';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';

@Injectable()
export class FoldersService {
  constructor(
    private readonly foldersRepository: FoldersRepository,
    private readonly activity: ActivityRecorderService,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async create(dto: CreateFolderDto, actor: AuthUser): Promise<FolderResponseDto> {
    const ownerId = new Types.ObjectId(actor.id);
    let parentId: Types.ObjectId | null = null;
    let ancestors: Types.ObjectId[] = [];

    if (dto.parentId) {
      const parentFolder = await this.foldersRepository.findActiveById(dto.parentId);
      if (!parentFolder) {
        throw new FolderNotFoundException(dto.parentId);
      }
      this.assertOwnership(parentFolder.ownerId, actor.id);
      parentId = parentFolder._id;
      ancestors = [...parentFolder.ancestors, parentFolder._id];
    }

    const nameExists = await this.foldersRepository.existsActiveSiblingByName(
      ownerId,
      parentId,
      dto.name,
    );

    if (nameExists) {
      throw new FolderNameConflictException(dto.name);
    }

    const created = await this.foldersRepository.create({
      ownerId,
      parentId,
      name: dto.name,
      ancestors,
    });

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.FOLDER_CREATED,
      description: `Creó la carpeta «${created.name}»`,
      resource: {
        type: ResourceType.FOLDER,
        id: created._id.toString(),
        name: created.name,
      },
      metadata: {
        toFolderId: parentId,
      },
    });

    return FolderMapper.toResponse(created);
  }

  async findContent(folderId: string | null, actor: AuthUser): Promise<FolderContentResponseDto> {
    let currentFolder = null;
    let breadcrumbs: FolderBreadcrumbDto[] = [];
    const ownerId = new Types.ObjectId(actor.id);

    if (folderId) {
      currentFolder = await this.foldersRepository.findActiveById(folderId);
      if (!currentFolder) {
        throw new FolderNotFoundException(folderId);
      }
      this.assertOwnership(currentFolder.ownerId, actor.id);

      if (currentFolder.ancestors.length > 0) {
        const ancestorDocs = await this.foldersRepository.findByIds(currentFolder.ancestors);
        const map = new Map(ancestorDocs.map((doc) => [doc._id.toString(), doc.name]));
        breadcrumbs = currentFolder.ancestors.map((ancId) => ({
          id: ancId.toString(),
          name: map.get(ancId.toString()) || '',
        }));
      }

      breadcrumbs.push({
        id: currentFolder._id.toString(),
        name: currentFolder.name,
      });
    }

    const childrenFolders = await this.foldersRepository.findActiveChildren(
      ownerId,
      folderId ? new Types.ObjectId(folderId) : null,
    );

    return FolderMapper.toContentResponse(currentFolder, breadcrumbs, childrenFolders, []);
  }

  async findById(id: string, actor: AuthUser): Promise<FolderResponseDto> {
    const folder = await this.foldersRepository.findActiveById(id);
    if (!folder) {
      throw new FolderNotFoundException(id);
    }
    this.assertOwnership(folder.ownerId, actor.id);
    return FolderMapper.toResponse(folder);
  }

  async rename(id: string, dto: RenameFolderDto, actor: AuthUser): Promise<FolderResponseDto> {
    const folder = await this.foldersRepository.findActiveById(id);
    if (!folder) {
      throw new FolderNotFoundException(id);
    }
    this.assertOwnership(folder.ownerId, actor.id);

    if (folder.name === dto.name) {
      return FolderMapper.toResponse(folder);
    }

    const nameExists = await this.foldersRepository.existsActiveSiblingByName(
      folder.ownerId,
      folder.parentId,
      dto.name,
      folder._id,
    );

    if (nameExists) {
      throw new FolderNameConflictException(dto.name);
    }

    const previousName = folder.name;
    const updated = await this.foldersRepository.rename(id, dto.name);
    if (!updated) {
      throw new FolderNotFoundException(id);
    }

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.FOLDER_RENAMED,
      description: `Renombró la carpeta «${previousName}» a «${dto.name}»`,
      resource: {
        type: ResourceType.FOLDER,
        id: updated._id.toString(),
        name: updated.name,
      },
      metadata: {
        previousName,
      },
    });

    return FolderMapper.toResponse(updated);
  }

  async move(id: string, dto: MoveFolderDto, actor: AuthUser): Promise<FolderResponseDto> {
    const folder = await this.foldersRepository.findActiveById(id);
    if (!folder) {
      throw new FolderNotFoundException(id);
    }
    this.assertOwnership(folder.ownerId, actor.id);

    const targetParentId = dto.targetParentId ? new Types.ObjectId(dto.targetParentId) : null;
    const currentParentId = folder.parentId ? folder.parentId.toString() : null;
    const newParentIdStr = targetParentId ? targetParentId.toString() : null;

    if (currentParentId === newParentIdStr) {
      return FolderMapper.toResponse(folder);
    }

    let targetAncestors: Types.ObjectId[] = [];
    if (targetParentId) {
      if (folder._id.equals(targetParentId)) {
        throw new FolderCycleException('No se puede mover una carpeta dentro de sí misma');
      }

      const targetParent = await this.foldersRepository.findActiveById(targetParentId);
      if (!targetParent) {
        throw new FolderNotFoundException(targetParentId.toString());
      }
      this.assertOwnership(targetParent.ownerId, actor.id);

      const isDescendant = targetParent.ancestors.some((ancId) => ancId.equals(folder._id));
      if (isDescendant) {
        throw new FolderCycleException('No se puede mover una carpeta a una subcarpeta descendiente');
      }

      targetAncestors = [...targetParent.ancestors, targetParent._id];
    }

    // Check sibling name conflict at target location
    const nameExists = await this.foldersRepository.existsActiveSiblingByName(
      folder.ownerId,
      targetParentId,
      folder.name,
      folder._id,
    );

    if (nameExists) {
      throw new FolderNameConflictException(folder.name);
    }

    const fromFolderId = folder.parentId;
    let updatedFolder: FolderResponseDto;

    // Transaction for moving folder and rewriting descendant ancestors
    await this.connection.transaction(async (session) => {
      const newFolderAncestors = targetAncestors;
      const oldAncestorChainLength = folder.ancestors.length + 1; // includes folder itself
      const newAncestorPrefix = [...targetAncestors, folder._id];

      const descendants = await this.foldersRepository.findDescendants(folder._id, session);

      await this.foldersRepository.updateFolderParentAndAncestors(
        folder._id,
        targetParentId,
        newFolderAncestors,
        session,
      );

      if (descendants.length > 0) {
        await this.foldersRepository.rewriteDescendantsAncestors(
          descendants,
          oldAncestorChainLength,
          newAncestorPrefix,
          session,
        );
      }

      await this.activity.recordAndWait(
        {
          actor: { id: actor.id, username: actor.username, email: actor.email },
          action: ActivityAction.FOLDER_MOVED,
          description: `Movió la carpeta «${folder.name}»`,
          resource: {
            type: ResourceType.FOLDER,
            id: folder._id.toString(),
            name: folder.name,
          },
          metadata: {
            fromFolderId,
            toFolderId: targetParentId,
          },
        },
        session,
      );
    });

    const refreshed = await this.foldersRepository.findActiveById(id);
    return FolderMapper.toResponse(refreshed!);
  }

  private assertOwnership(ownerId: Types.ObjectId, actorId: string): void {
    if (ownerId.toString() !== actorId) {
      throw new AccessDeniedException('No tienes permisos sobre este recurso');
    }
  }
}
