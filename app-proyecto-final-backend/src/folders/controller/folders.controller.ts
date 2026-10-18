import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FoldersService } from '../service/folders.service';
import { CreateFolderDto } from '../dto/request/create-folder.dto';
import { RenameFolderDto } from '../dto/request/rename-folder.dto';
import { MoveFolderDto } from '../dto/request/move-folder.dto';
import { FolderResponseDto } from '../dto/response/folder-response.dto';
import { FolderContentResponseDto } from '../dto/response/folder-content-response.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/users/models/auth-user.model';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';

@ApiTags('Folders')
@Controller('folders')
@RequirePermissions(Permission.DRIVE_ACCESS)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiOkResponse({ type: FolderResponseDto })
  create(
    @Body() dto: CreateFolderDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<FolderResponseDto> {
    return this.foldersService.create(dto, actor);
  }

  @Get('root')
  @ApiOperation({ summary: 'List contents of the virtual root folder (Mi unidad)' })
  @ApiOkResponse({ type: FolderContentResponseDto })
  findRootContent(@CurrentUser() actor: AuthUser): Promise<FolderContentResponseDto> {
    return this.foldersService.findContent(null, actor);
  }

  @Get(':id/content')
  @ApiOperation({ summary: 'List contents and breadcrumbs of a specific folder' })
  @ApiOkResponse({ type: FolderContentResponseDto })
  findFolderContent(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<FolderContentResponseDto> {
    return this.foldersService.findContent(id, actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder details by ID' })
  @ApiOkResponse({ type: FolderResponseDto })
  findById(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<FolderResponseDto> {
    return this.foldersService.findById(id, actor);
  }

  @Patch(':id/rename')
  @ApiOperation({ summary: 'Rename a folder' })
  @ApiOkResponse({ type: FolderResponseDto })
  rename(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RenameFolderDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<FolderResponseDto> {
    return this.foldersService.rename(id, dto, actor);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a folder to another parent or to root' })
  @ApiOkResponse({ type: FolderResponseDto })
  move(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: MoveFolderDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<FolderResponseDto> {
    return this.foldersService.move(id, dto, actor);
  }
}
