/* Top user by storage used response model */
export interface TopUserByStorageResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  usedBytes: number;
  quotaBytes: number;
}
