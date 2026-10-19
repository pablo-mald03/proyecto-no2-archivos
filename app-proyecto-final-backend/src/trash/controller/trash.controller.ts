import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrashService } from '../service/trash.service';
import { TrashItemDto } from '../dto/response/trash-item.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/users/models/auth-user.model';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';

/*Principal trash controller class*/
@ApiTags('Trash')
@Controller('trash')
@RequirePermissions(Permission.DRIVE_ACCESS)
export class TrashController {
  constructor(private readonly trashService: TrashService) { }

  //Endpoint to list all root deleted items in trash for current user
  @Get()
  @ApiOperation({ summary: 'List all root deleted items in trash for current user' })
  @ApiOkResponse({ type: [TrashItemDto] })
  listTrash(@CurrentUser() actor: AuthUser): Promise<TrashItemDto[]> {
    return this.trashService.listTrash(actor);
  }

  //Endpoint to send a file or folder to trash
  @Post(':type/:id')
  @ApiOperation({ summary: 'Send a file or folder to trash' })
  moveToTrash(
    @Param('type') type: 'files' | 'folders',
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<void> {
    const resourceType = type === 'files' ? 'FILE' : 'FOLDER';
    return this.trashService.moveToTrash(resourceType, id, actor);
  }

  //Endpoint to restore a deleted file or folder batch from trash
  @Patch(':trashBatchId/restore')
  @ApiOperation({ summary: 'Restore a deleted file or folder batch from trash' })
  restoreFromTrash(
    @Param('trashBatchId', ParseObjectIdPipe) trashBatchId: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<void> {
    return this.trashService.restoreFromTrash(trashBatchId, actor);
  }

  //Endpoint to permanently delete a file or folder batch
  @Delete(':trashBatchId/permanent')
  @ApiOperation({ summary: 'Permanently delete a file or folder batch' })
  deletePermanently(
    @Param('trashBatchId', ParseObjectIdPipe) trashBatchId: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<void> {
    return this.trashService.deletePermanently(trashBatchId, actor);
  }
}
