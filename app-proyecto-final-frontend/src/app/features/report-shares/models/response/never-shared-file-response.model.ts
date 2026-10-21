/* Never shared file response model */
export interface NeverSharedFileResponse {
  fileId: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  ownerUsername: string;
  ownerEmail: string;
  createdAt: string;
}
