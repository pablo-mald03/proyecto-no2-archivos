/*Folder response model representation */
export interface FolderResponse {
  id: string;
  ownerId: string;
  parentId: string | null;
  name: string;
  ancestors: string[];
  createdAt: string;
  updatedAt: string;
}
