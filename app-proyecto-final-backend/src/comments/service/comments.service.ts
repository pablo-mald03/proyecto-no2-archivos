import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentsRepository } from '../repository/comments.repository';
import { FilesRepository } from 'src/files/repository/files.repository';
import { FoldersRepository } from 'src/folders/repository/folders.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { AccessResolverService } from 'src/sharing/service/access-resolver.service';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { AuthUser } from 'src/users/models/auth-user.model';
import { CreateCommentDto } from '../dto/request/create-comment.dto';
import { UpdateCommentDto } from '../dto/request/update-comment.dto';
import { CommentResponseDto } from '../dto/response/comment-response.dto';
import { CommentMapper } from '../mapper/comment.mapper';
import { FileNotFoundException } from 'src/files/exceptions/file-not-found.exception';
import { CommentNotFoundException } from '../exceptions/comment-not-found.exception';
import { AccessDeniedException } from 'src/common/exceptions/access-deniend.exception';
import { AccessLevel } from 'src/common/constants/permissions/access-level';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';

/*Principal comments service class*/
@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly filesRepository: FilesRepository,
    private readonly foldersRepository: FoldersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly accessResolver: AccessResolverService,
    private readonly activity: ActivityRecorderService,
  ) { }

  //Method to create a comment
  async createComment(fileId: string, dto: CreateCommentDto, actor: AuthUser): Promise<CommentResponseDto> {
    const file = await this.getFileOrFail(fileId);
    const ancestors = await this.resolveFolderAncestors(file.folderId);
    await this.accessResolver.assertAccess(
      {
        type: 'FILE',
        id: file._id,
        ownerId: file.ownerId,
        ancestors,
      },
      actor.id,
      AccessLevel.COMMENTER,
      'Se requiere al menos permiso de comentarista para comentar en este archivo',
    );

    let parentOid: Types.ObjectId | null = null;
    if (dto.parentId) {
      const parentComment = await this.commentsRepository.findById(dto.parentId);
      if (!parentComment || parentComment.fileId.toString() !== fileId) {
        throw new CommentNotFoundException(dto.parentId);
      }
      parentOid = parentComment._id;
    }

    const created = await this.commentsRepository.create({
      fileId: file._id,
      authorId: new Types.ObjectId(actor.id),
      parentId: parentOid,
      content: dto.content,
    });

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.COMMENT_ADDED,
      description: `Comentó en el archivo "${file.name}"`,
      resource: { type: ResourceType.FILE, id: file._id.toString(), name: file.name },
    });

    return CommentMapper.toResponse(created, {
      username: actor.username,
      email: actor.email,
    });
  }

  //Method to list comments of a file
  async findByFile(fileId: string, actor: AuthUser): Promise<CommentResponseDto[]> {
    const file = await this.getFileOrFail(fileId);

    const ancestors = await this.resolveFolderAncestors(file.folderId);
    await this.accessResolver.assertAccess(
      {
        type: 'FILE',
        id: file._id,
        ownerId: file.ownerId,
        ancestors,
      },
      actor.id,
      AccessLevel.VIEWER,
    );

    const comments = await this.commentsRepository.findByFile(fileId);
    if (!comments.length) return [];

    const authorIds = [...new Set(comments.map((c) => c.authorId.toString()))];
    const userMap = new Map<string, { username: string; email: string }>();

    for (const uid of authorIds) {
      const user = await this.usersRepository.findById(uid);
      if (user) {
        userMap.set(uid, { username: user.username, email: user.email });
      }
    }

    return CommentMapper.toTree(comments, userMap);
  }

  //Method to edit a comment
  async updateComment(commentId: string, dto: UpdateCommentDto, actor: AuthUser,): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) throw new CommentNotFoundException(commentId);

    if (comment.isDeleted) {
      throw new AccessDeniedException('No se puede editar un comentario eliminado');
    }

    if (comment.authorId.toString() !== actor.id) {
      throw new AccessDeniedException('Solo el autor puede editar su comentario');
    }

    const updated = await this.commentsRepository.updateContent(commentId, dto.content);
    return CommentMapper.toResponse(updated!, {
      username: actor.username,
      email: actor.email,
    });
  }

  //Method to delete a comment
  async deleteComment(commentId: string, actor: AuthUser): Promise<void> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) throw new CommentNotFoundException(commentId);

    const file = await this.filesRepository.findById(comment.fileId);
    const isAuthor = comment.authorId.toString() === actor.id;
    const isFileOwner = file?.ownerId.toString() === actor.id;

    if (!isAuthor && !isFileOwner) {
      throw new AccessDeniedException(
        'Solo el autor del comentario o el propietario del archivo pueden eliminar este comentario',
      );
    }

    const replyCount = await this.commentsRepository.countReplies(comment._id);

    if (replyCount > 0) {
      await this.commentsRepository.softDelete(comment._id);
    } else {
      await this.commentsRepository.deleteById(comment._id);
    }
  }

  //Helper method to get a file or throw an exception
  private async getFileOrFail(fileId: string) {
    const file = await this.filesRepository.findActiveById(fileId);
    if (!file) throw new FileNotFoundException(fileId);
    return file;
  }

  //Helper method to resolve folder ancestors
  private async resolveFolderAncestors(folderId: Types.ObjectId | null): Promise<Types.ObjectId[]> {
    if (!folderId) return [];
    const folder = await this.foldersRepository.findActiveById(folderId);
    if (!folder) return [folderId];
    return [...folder.ancestors, folder._id];
  }
}
