/* User root folder space response model */
export interface UserRootFolderSpaceResponse {
  folderId: string;
  folderName: string;
  totalSizeBytes: number;
  fileCount: number;
  createdAt: string;
}
