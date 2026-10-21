/** Top user by storage used response model */
export class TopUserByStorageDto {
  userId!: string;
  username!: string;
  email!: string;
  fullName!: string;
  usedBytes!: number;
  quotaBytes!: number;
}
