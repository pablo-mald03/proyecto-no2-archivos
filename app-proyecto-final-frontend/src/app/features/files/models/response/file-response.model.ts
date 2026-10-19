/*File response model representation */
export interface FileResponse {
  id: string;
  ownerId: string;
  folderId: string | null;
  name: string;
  extension: 'txt' | 'md' | string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}
