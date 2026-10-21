import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/users/models/auth-user.model';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { FilesService } from '../service/files.service';
import { FileResponseDto } from '../dto/response/file-response.dto';
import { UpdateFileContentDto } from '../dto/request/update-file-content.dto';
import { RenameFileDto } from '../dto/request/rename-file.dto';
import { MoveFileDto } from '../dto/request/move-file.dto';
import { RecentFilesQueryDto } from '../dto/request/recent-files-query.dto';

//Principal files controller class
@ApiTags('Files')
@Controller('files')
@RequirePermissions(Permission.DRIVE_ACCESS)
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  //Endpoint to upload one or multiple .txt and .md files
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload one or multiple .txt and .md files' })
  @ApiOkResponse({ type: [FileResponseDto] })
  upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query('folderId') folderId: string | null,
    @CurrentUser() actor: AuthUser,
  ): Promise<FileResponseDto[]> {
    return this.filesService.uploadFiles(files, folderId || null, actor);
  }

  //Endpoint to get recent active files of the current user
  @Get('recent')
  @ApiOperation({ summary: 'List recent active files of the current user' })
  @ApiOkResponse({ type: [FileResponseDto] })
  findRecent(
    @CurrentUser() actor: AuthUser,
    @Query() query: RecentFilesQueryDto,
  ): Promise<FileResponseDto[]> {
    return this.filesService.findRecent(actor, query.limit);
  }

  //Endpoint to get file metadata by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiOkResponse({ type: FileResponseDto })
  findById(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<FileResponseDto> {
    return this.filesService.findById(id, actor);
  }

  //Endpoint to download or stream file content
  @Get(':id/download')
  @ApiOperation({ summary: 'Download or stream file content' })
  async download(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, file } = await this.filesService.downloadFile(id, actor);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length': file.sizeBytes,
    });

    stream.pipe(res);
  }

  //Endpoint to update text content of a file
  @Patch(':id/content')
  @ApiOperation({ summary: 'Update text content of a file' })
  @ApiOkResponse({ type: FileResponseDto })
  updateContent(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateFileContentDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<FileResponseDto> {
    return this.filesService.updateContent(id, dto, actor);
  }

  //Endpoint to rename a file
  @Patch(':id/rename')
  @ApiOperation({ summary: 'Rename a file' })
  @ApiOkResponse({ type: FileResponseDto })
  rename(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RenameFileDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<FileResponseDto> {
    return this.filesService.rename(id, dto, actor);
  }

  //Endpoint to move a file to another folder
  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a file to another folder' })
  @ApiOkResponse({ type: FileResponseDto })
  move(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: MoveFileDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<FileResponseDto> {
    return this.filesService.move(id, dto, actor);
  }
}
