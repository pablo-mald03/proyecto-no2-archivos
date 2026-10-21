/* Top user by file count response model */
export interface TopUserByFileCountResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  fileCount: number;
}
