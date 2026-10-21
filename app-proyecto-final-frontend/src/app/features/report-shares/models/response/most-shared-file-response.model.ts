/* Most shared file response model */
export interface MostSharedFileResponse {
  fileId: string;
  fileName: string;
  extension: string;
  ownerUsername: string;
  ownerEmail: string;
  shareCount: number;
}
