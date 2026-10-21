/*Principal comment response dto model*/
export class CommentResponseDto {
  id!: string;
  fileId!: string;
  authorId!: string;
  authorUsername!: string;
  authorEmail!: string;
  parentId!: string | null;
  content!: string;
  isDeleted!: boolean;
  editedAt!: string | null;
  createdAt!: string;
  replies?: CommentResponseDto[];
}
