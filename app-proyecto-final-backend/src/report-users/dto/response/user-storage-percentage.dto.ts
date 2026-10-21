/** Storage percentage per user response model */
export class UserStoragePercentageDto {
  userId!: string;
  username!: string;
  email!: string;
  fullName!: string;
  usedBytes!: number;
  quotaBytes!: number;
  percentageUsed!: number;
}
