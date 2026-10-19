export interface FileComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  content: string;
  isOwner?: boolean;
}