/* File comment model representation */
export interface FileComment {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  editedAt?: Date | null;
  content: string;
  parentId?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
  replies?: FileComment[];
  isOwner?: boolean;
}