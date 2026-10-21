/* User storage percentage response model */
export interface UserStoragePercentageResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  usedBytes: number;
  quotaBytes: number;
  percentageUsed: number;
}
