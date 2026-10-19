import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/users/models/auth-user.model';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { CommentsService } from '../service/comments.service';
import { CommentResponseDto } from '../dto/response/comment-response.dto';
import { CreateCommentDto } from '../dto/request/create-comment.dto';
import { UpdateCommentDto } from '../dto/request/update-comment.dto';

/*Principal comments controller class*/
@ApiTags('Comments')
@Controller('comments')
@RequirePermissions(Permission.DRIVE_ACCESS)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  //Endpoint to add a comment or nested reply to a file
  @Post('files/:fileId')
  @ApiOperation({ summary: 'Add a comment or nested reply to a file (requires COMMENTER access)' })
  @ApiOkResponse({ type: CommentResponseDto })
  createComment(
    @Param('fileId', ParseObjectIdPipe) fileId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<CommentResponseDto> {
    return this.commentsService.createComment(fileId, dto, actor);
  }

  //Endpoint to list threaded comments for a file
  @Get('files/:fileId')
  @ApiOperation({ summary: 'List threaded comments for a file' })
  @ApiOkResponse({ type: [CommentResponseDto] })
  findByFile(
    @Param('fileId', ParseObjectIdPipe) fileId: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.findByFile(fileId, actor);
  }

  //Endpoint to edit comment content
  @Patch(':id')
  @ApiOperation({ summary: 'Edit comment content' })
  @ApiOkResponse({ type: CommentResponseDto })
  updateComment(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<CommentResponseDto> {
    return this.commentsService.updateComment(id, dto, actor);
  }

  //Endpoint to delete a comment
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  deleteComment(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<void> {
    return this.commentsService.deleteComment(id, actor);
  }
}
