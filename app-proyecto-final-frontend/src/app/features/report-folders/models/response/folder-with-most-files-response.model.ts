/* Folder with most files response model */
export interface FolderWithMostFilesResponse {
  folderId: string;
  folderName: string;
  ownerUsername: string;
  ownerEmail: string;
  fileCount: number;
  createdAt: string;
}
