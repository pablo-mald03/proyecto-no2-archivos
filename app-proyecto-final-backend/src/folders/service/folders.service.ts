import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { FoldersRepository } from '../repository/folders.repository';
import { FolderHierarchyHelperService } from './folder-hierarchy-helper.service';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { AuthUser } from 'src/users/models/auth-user.model';
import { CreateFolderDto } from '../dto/request/create-folder.dto';
import { RenameFolderDto } from '../dto/request/rename-folder.dto';
import { MoveFolderDto } from '../dto/request/move-folder.dto';
import { ListFolderContentQueryDto } from '../dto/request/list-folder-content-query.dto';
import { FolderResponseDto } from '../dto/response/folder-response.dto';
import { FolderContentResponseDto } from '../dto/response/folder-content-response.dto';
import { FolderMapper } from '../mapper/folder.mapper';
import { FolderNotFoundException } from '../exceptions/folder-not-found.exception';
import { FolderNameConflictException } from '../exceptions/folder-name-conflict.exception';
import { AccessDeniedException } from 'src/common/exceptions/access-deniend.exception';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';
import { FilesRepository } from 'src/files/repository/files.repository';
import { FileMapper } from 'src/files/mapper/file.mapper';
import { PageResponseDto } from 'src/common/dto/page-response.dto';

/* Principal folder service */
@Injectable()
export class FoldersService {
  constructor(
    private readonly foldersRepository: FoldersRepository,
    private readonly hierarchyHelper: FolderHierarchyHelperService,
    private readonly filesRepository: FilesRepository,
    private readonly activity: ActivityRecorderService,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  /*Principal method to create a new folder*/
  async create(dto: CreateFolderDto, actor: AuthUser): Promise<FolderResponseDto> {
    const ownerId = new Types.ObjectId(actor.id);
    let parentId: Types.ObjectId | null = null;
    let ancestors: Types.ObjectId[] = [];

    if (dto.parentId) {
      const parentFolder = await this.getOrFail(dto.parentId);
      this.assertOwnership(parentFolder.ownerId, actor.id);
      parentId = parentFolder._id;
      ancestors = [...parentFolder.ancestors, parentFolder._id];
    }

    const nameExists = await this.foldersRepository.existsActiveSiblingByName(ownerId, parentId, dto.name);
    if (nameExists) throw new FolderNameConflictException(dto.name);

    const created = await this.foldersRepository.create({ ownerId, parentId, name: dto.name, ancestors });

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.FOLDER_CREATED,
      description: `Creo la carpeta "${created.name}"`,
      resource: { type: ResourceType.FOLDER, id: created._id.toString(), name: created.name },
      metadata: { toFolderId: parentId },
    });

    return FolderMapper.toResponse(created);
  }

  /*Principal method to find the content of a folder with filters and pagination*/
  async findContent(
    folderId: string | null,
    actor: AuthUser,
    query: ListFolderContentQueryDto,
  ): Promise<FolderContentResponseDto> {
    let currentFolder = null;
    let breadcrumbs: any[] = [];
    const ownerId = new Types.ObjectId(actor.id);

    if (folderId) {
      currentFolder = await this.getOrFail(folderId);
      this.assertOwnership(currentFolder.ownerId, actor.id);
      breadcrumbs = await this.hierarchyHelper.buildBreadcrumbs(currentFolder);
    }

    const targetParentOid = folderId ? new Types.ObjectId(folderId) : null;
    const shouldFetchFolders = query.type === 'ALL' || query.type === 'FOLDERS_ONLY';
    const shouldFetchFiles = query.type === 'ALL' || query.type === 'FILES_ONLY';

    const foldersPromise = shouldFetchFolders
      ? this.foldersRepository.findPage(
        {
          ownerId,
          parentId: targetParentOid,
          search: query.search,
          isDeleted: false,
        },
        {
          page: query.page,
          size: query.size,
          sortBy: query.sortBy,
          direction: query.direction,
        },
      )
      : Promise.resolve({ content: [], total: 0 });

    const filesPromise = shouldFetchFiles
      ? this.filesRepository.findPage(
        {
          ownerId,
          folderId: targetParentOid,
          search: query.search,
          extension: query.extension,
          isDeleted: false,
        },
        {
          page: query.page,
          size: query.size,
          sortBy: query.sortBy,
          direction: query.direction,
        },
      )
      : Promise.resolve({ content: [], total: 0 });

    const [foldersResult, filesResult] = await Promise.all([foldersPromise, filesPromise]);

    const foldersPage = PageResponseDto.of(
      foldersResult.content.map((f) => FolderMapper.toResponse(f)),
      foldersResult.total,
      query,
    );

    const filesPage = PageResponseDto.of(
      filesResult.content.map((f) => FileMapper.toResponse(f)),
      filesResult.total,
      query,
    );

    return FolderMapper.toPaginatedContentResponse(
      currentFolder,
      breadcrumbs,
      foldersPage,
      filesPage,
    );
  }

  /*Principal method to find a folder by ID*/
  async findById(id: string, actor: AuthUser): Promise<FolderResponseDto> {
    const folder = await this.getOrFail(id);
    this.assertOwnership(folder.ownerId, actor.id);
    return FolderMapper.toResponse(folder);
  }

  /*Principal method to rename a folder*/
  async rename(id: string, dto: RenameFolderDto, actor: AuthUser): Promise<FolderResponseDto> {
    const folder = await this.getOrFail(id);
    this.assertOwnership(folder.ownerId, actor.id);
    if (folder.name === dto.name) return FolderMapper.toResponse(folder);

    const nameExists = await this.foldersRepository.existsActiveSiblingByName(
      folder.ownerId,
      folder.parentId,
      dto.name,
      folder._id,
    );
    if (nameExists) throw new FolderNameConflictException(dto.name);

    const previousName = folder.name;
    const updated = await this.foldersRepository.rename(id, dto.name);

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.FOLDER_RENAMED,
      description: `Renombro la carpeta "${previousName}" a "${dto.name}"`,
      resource: { type: ResourceType.FOLDER, id: updated!._id.toString(), name: updated!.name },
      metadata: { previousName },
    });

    return FolderMapper.toResponse(updated!);
  }

  /*Principal method to move a folder*/
  async move(id: string, dto: MoveFolderDto, actor: AuthUser): Promise<FolderResponseDto> {
    const folder = await this.getOrFail(id);
    this.assertOwnership(folder.ownerId, actor.id);

    const targetParentId = dto.targetParentId ? new Types.ObjectId(dto.targetParentId) : null;
    if ((folder.parentId?.toString() || null) === (targetParentId?.toString() || null)) {
      return FolderMapper.toResponse(folder);
    }

    const targetAncestors = await this.hierarchyHelper.validateMoveTarget(
      folder._id,
      targetParentId,
      actor.id,
    );

    const nameExists = await this.foldersRepository.existsActiveSiblingByName(
      folder.ownerId,
      targetParentId,
      folder.name,
      folder._id,
    );
    if (nameExists) throw new FolderNameConflictException(folder.name);

    const fromFolderId = folder.parentId;

    await this.connection.transaction(async (session) => {
      const descendants = await this.foldersRepository.findDescendants(folder._id, session);
      await this.foldersRepository.updateFolderParentAndAncestors(folder._id, targetParentId, targetAncestors, session);

      if (descendants.length > 0) {
        const oldAncestorChainLength = folder.ancestors.length + 1;
        const newAncestorPrefix = [...targetAncestors, folder._id];
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
          description: `Movio la carpeta "${folder.name}"`,
          resource: { type: ResourceType.FOLDER, id: folder._id.toString(), name: folder.name },
          metadata: { fromFolderId, toFolderId: targetParentId },
        },
        session,
      );
    });

    const refreshed = await this.foldersRepository.findActiveById(id);
    return FolderMapper.toResponse(refreshed!);
  }

  /*Principal helper method to get a folder by ID*/
  private async getOrFail(id: string) {
    const folder = await this.foldersRepository.findActiveById(id);
    if (!folder) throw new FolderNotFoundException(id);
    return folder;
  }

  /*Principal helper method to assert ownership*/
  private assertOwnership(ownerId: Types.ObjectId, actorId: string): void {
    if (ownerId.toString() !== actorId) {
      throw new AccessDeniedException('No tienes permisos sobre este recurso');
    }
  }
}
