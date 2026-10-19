import { CommentDocument } from '../entities/comment.entity';
import { CommentResponseDto } from '../dto/response/comment-response.dto';

/*Principal comment mapper class*/
export class CommentMapper {

  /*Method to map a comment document to a response dto*/
  static toResponse(doc: CommentDocument, author: { username: string; email: string }, replies: CommentResponseDto[] = [],): CommentResponseDto {
    return {
      id: doc._id.toString(),
      fileId: doc.fileId.toString(),
      authorId: doc.authorId.toString(),
      authorUsername: author.username,
      authorEmail: author.email,
      parentId: doc.parentId ? doc.parentId.toString() : null,
      content: doc.content,
      isDeleted: doc.isDeleted,
      editedAt: doc.editedAt ? doc.editedAt.toISOString() : null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      replies,
    };
  }

  /*Method to transform a flat list of comments into a nested tree*/
  static toTree(docs: CommentDocument[], userMap: Map<string, { username: string; email: string }>,): CommentResponseDto[] {
    const itemMap = new Map<string, CommentResponseDto>();
    const rootComments: CommentResponseDto[] = [];

    for (const doc of docs) {
      const author = userMap.get(doc.authorId.toString()) || {
        username: 'Usuario',
        email: '',
      };
      const dto = CommentMapper.toResponse(doc, author, []);
      itemMap.set(dto.id, dto);
    }

    for (const doc of docs) {
      const dto = itemMap.get(doc._id.toString())!;
      if (doc.parentId) {
        const parentDto = itemMap.get(doc.parentId.toString());
        if (parentDto) {
          parentDto.replies!.push(dto);
        } else {
          rootComments.push(dto);
        }
      } else {
        rootComments.push(dto);
      }
    }

    return rootComments;
  }
}
