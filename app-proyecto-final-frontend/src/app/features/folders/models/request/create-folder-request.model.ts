/*Create folder request model */
export interface CreateFolderRequest {
  name: string;
  parentId?: string | null;
}
