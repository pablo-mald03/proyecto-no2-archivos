/*Create comment request model */
export interface CreateCommentRequest {
  content: string;
  parentId?: string | null;
}
