import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { FoldersRepository } from 'src/folders/repository/folders.repository';
import { AuthUser } from 'src/users/models/auth-user.model';
import { FolderNotFoundException } from 'src/folders/exceptions/folder-not-found.exception';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';
import { AccessLevel } from 'src/common/constants/permissions/access-level';
import { FilesRepository } from '../repository/files.repository';
import { GridFsStorageService } from './grid-fs-storage.service';
import { FileValidationHelperService } from './file-validation-helper.service';
import { FileQuotaHelperService } from './file-quota-helper.service';
import { FileAccessHelperService } from './file-access-helper.service';
import { FileResponseDto } from '../dto/response/file-response.dto';
import { FileMapper } from '../mapper/file.mapper';
import { UpdateFileContentDto } from '../dto/request/update-file-content.dto';
import { RenameFileDto } from '../dto/request/rename-file.dto';
import { FileNameConflictException } from '../exceptions/file-name-conflict.exception';
import { MoveFileDto } from '../dto/request/move-file.dto';
import { FileNotFoundException } from '../exceptions/file-not-found.exception';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { RecentFilesQueryDto } from '../dto/request/recent-files-query.dto';


/*Principal files service class*/
@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly gridFsStorage: GridFsStorageService,
    private readonly validationHelper: FileValidationHelperService,
    private readonly quotaHelper: FileQuotaHelperService,
    private readonly accessHelper: FileAccessHelperService,
    private readonly foldersRepository: FoldersRepository,
    private readonly activity: ActivityRecorderService,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  /*Principal method to upload files*/
  async uploadFiles(files: Array<Express.Multer.File>, folderId: string | null, actor: AuthUser): Promise<FileResponseDto[]> {
    if (!files?.length) return [];

    const { targetFolderOid, quotaOwnerId } = await this.accessHelper.assertDestinationFolderUploadAccess(folderId, actor.id);

    const prepared = files.map((f) => {
      const name = Buffer.from(f.originalname, 'latin1').toString('utf8');
      const { extension, mimeType } = this.validationHelper.parseAndValidateExtension(name);
      return { file: f, name, extension, mimeType, size: f.size };
    });

    const totalSizeBytes = prepared.reduce((sum, f) => sum + f.size, 0);
    await this.quotaHelper.reserveOrThrow(
      quotaOwnerId,
      totalSizeBytes,
      'El almacenamiento del propietario no tiene suficiente espacio para subir los archivos',
    );

    const createdResults: FileResponseDto[] = [];
    const uploadedGridFsIds: Types.ObjectId[] = [];

    try {
      for (const prep of prepared) {
        const gridFsId = await this.gridFsStorage.uploadFile(prep.name, prep.file.buffer, prep.mimeType);
        uploadedGridFsIds.push(gridFsId);
      }

      await this.connection.transaction(async (session) => {
        for (let i = 0; i < prepared.length; i++) {
          const prep = prepared[i];
          const gridFsId = uploadedGridFsIds[i];

          const finalName = await this.validationHelper.resolveAvailableName(
            quotaOwnerId,
            targetFolderOid,
            prep.name,
            prep.extension,
            session,
          );

          const fileDoc = await this.filesRepository.create(
            {
              ownerId: quotaOwnerId,
              folderId: targetFolderOid,
              name: finalName,
              extension: prep.extension,
              mimeType: prep.mimeType,
              sizeBytes: prep.size,
              gridFsId,
            },
            session,
          );

          createdResults.push(FileMapper.toResponse(fileDoc));

          await this.activity.recordAndWait(
            {
              actor: { id: actor.id, username: actor.username, email: actor.email },
              action: ActivityAction.FILE_UPLOADED,
              description: `Subio el archivo "${finalName}" (${prep.size} bytes)`,
              resource: { type: ResourceType.FILE, id: fileDoc._id.toString(), name: finalName },
              metadata: { toFolderId: targetFolderOid, sizeBytes: prep.size },
            },
            session,
          );
        }
      });

      return createdResults;
    } catch (err) {
      for (const gridFsId of uploadedGridFsIds) {
        await this.gridFsStorage.deleteFile(gridFsId).catch(() => { });
      }
      await this.quotaHelper.release(quotaOwnerId, totalSizeBytes);
      throw err;
    }
  }

  /*Method to find recent files of the current user with pagination and filters*/
  async findRecent(actor: AuthUser, query: RecentFilesQueryDto): Promise<PageResponseDto<FileResponseDto>> {
    const { content, total } = await this.filesRepository.findPage(
      {
        ownerId: actor.id,
        isDeleted: false,
        search: query.search,
        extension: query.extension,
        from: query.from,
        to: query.to,
        dateField: query.sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt',
      },
      {
        page: query.page,
        size: query.size,
        sortBy: query.sortBy,
        direction: query.direction,
      },
    );

    const items = content.map((file) => FileMapper.toResponse(file));
    return PageResponseDto.of(items, total, query);
  }

  /*Principal method to find a file*/
  async findById(id: string, actor: AuthUser): Promise<FileResponseDto> {
    const file = await this.getOrFail(id);
    await this.accessHelper.assertFileAccess(file, actor.id, AccessLevel.VIEWER);
    return FileMapper.toResponse(file);
  }

  /*Principal method to download a file*/
  async downloadFile(id: string, actor: AuthUser): Promise<{ stream: NodeJS.ReadableStream; file: FileResponseDto }> {

    const file = await this.getOrFail(id);
    await this.accessHelper.assertFileAccess(file, actor.id, AccessLevel.VIEWER);

    const stream = this.gridFsStorage.openDownloadStream(file.gridFsId);
    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.FILE_DOWNLOADED,
      description: `Descargo el archivo "${file.name}"`,
      resource: { type: ResourceType.FILE, id: file._id.toString(), name: file.name },
      metadata: { sizeBytes: file.sizeBytes },
    });

    return { stream, file: FileMapper.toResponse(file) };
  }

  /*Method to update the content of the file*/
  async updateContent(id: string, dto: UpdateFileContentDto, actor: AuthUser): Promise<FileResponseDto> {
    const file = await this.getOrFail(id);
    await this.accessHelper.assertFileAccess(file, actor.id, AccessLevel.EDITOR);

    const buffer = Buffer.from(dto.content, 'utf8');
    const newSizeBytes = buffer.length;
    const oldSizeBytes = file.sizeBytes;
    const sizeDiff = newSizeBytes - oldSizeBytes;

    if (sizeDiff > 0) {
      await this.quotaHelper.reserveOrThrow(
        file.ownerId,
        sizeDiff,
        'La cuota del propietario no tiene suficiente espacio para modificar',
      );
    }

    let newGridFsId: Types.ObjectId | null = null;
    const oldGridFsId = file.gridFsId;

    try {
      newGridFsId = await this.gridFsStorage.uploadFile(file.name, buffer, file.mimeType);

      await this.connection.transaction(async (session) => {
        await this.filesRepository.updateContent(file._id, newGridFsId!, newSizeBytes, session);
        if (sizeDiff < 0) {
          await this.quotaHelper.release(file.ownerId, Math.abs(sizeDiff), session);
        }

        await this.activity.recordAndWait(
          {
            actor: { id: actor.id, username: actor.username, email: actor.email },
            action: ActivityAction.FILE_EDITED,
            description: `Edito el contenido del archivo "${file.name}" (${oldSizeBytes} bytes a ${newSizeBytes} bytes)`,
            resource: { type: ResourceType.FILE, id: file._id.toString(), name: file.name },
            metadata: { previousSizeBytes: oldSizeBytes, sizeBytes: newSizeBytes },
          },
          session,
        );
      });

      await this.gridFsStorage.deleteFile(oldGridFsId).catch(() => { });
      const updated = await this.filesRepository.findActiveById(id);
      return FileMapper.toResponse(updated!);
    } catch (err) {
      if (newGridFsId) await this.gridFsStorage.deleteFile(newGridFsId).catch(() => { });
      if (sizeDiff > 0) await this.quotaHelper.release(file.ownerId, sizeDiff);
      throw err;
    }
  }


  /*Method to rename the file*/
  async rename(id: string, dto: RenameFileDto, actor: AuthUser): Promise<FileResponseDto> {
    const file = await this.getOrFail(id);
    this.accessHelper.assertOwner(file.ownerId, actor.id);

    if (file.name === dto.name) return FileMapper.toResponse(file);

    const parsed = this.validationHelper.parseAndValidateExtension(dto.name);
    const nameExists = await this.filesRepository.existsActiveSiblingByName(
      file.ownerId,
      file.folderId,
      dto.name,
      file._id,
    );
    if (nameExists) throw new FileNameConflictException(dto.name);

    const previousName = file.name;
    const updated = await this.filesRepository.rename(id, dto.name, parsed.extension, parsed.mimeType);

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.FILE_RENAMED,
      description: `Renombro el archivo "${previousName}" a "${dto.name}"`,
      resource: { type: ResourceType.FILE, id: file._id.toString(), name: dto.name },
      metadata: { previousName },
    });

    return FileMapper.toResponse(updated!);
  }

  /*Method to move the file*/
  async move(id: string, dto: MoveFileDto, actor: AuthUser): Promise<FileResponseDto> {
    const file = await this.getOrFail(id);
    this.accessHelper.assertOwner(file.ownerId, actor.id);

    const targetFolderId = dto.targetFolderId ? new Types.ObjectId(dto.targetFolderId) : null;
    const currentFolderIdStr = file.folderId?.toString() || null;
    const targetFolderIdStr = targetFolderId?.toString() || null;

    if (currentFolderIdStr === targetFolderIdStr) return FileMapper.toResponse(file);

    if (targetFolderId) {
      const targetFolder = await this.foldersRepository.findActiveById(targetFolderId);
      if (!targetFolder) throw new FolderNotFoundException(targetFolderId.toString());
      this.accessHelper.assertOwner(targetFolder.ownerId, actor.id);
    }

    const nameExists = await this.filesRepository.existsActiveSiblingByName(
      file.ownerId,
      targetFolderId,
      file.name,
      file._id,
    );
    if (nameExists) throw new FileNameConflictException(file.name);

    const fromFolderId = file.folderId;
    const updated = await this.filesRepository.move(id, targetFolderId);

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.FILE_MOVED,
      description: `Movi el archivo "${file.name}"`,
      resource: { type: ResourceType.FILE, id: file._id.toString(), name: file.name },
      metadata: { fromFolderId, toFolderId: targetFolderId },
    });

    return FileMapper.toResponse(updated!);
  }

  /*Method to get a file or throw exception if not found*/
  private async getOrFail(id: string) {
    const file = await this.filesRepository.findActiveById(id);
    if (!file) throw new FileNotFoundException(id);
    return file;
  }
}
