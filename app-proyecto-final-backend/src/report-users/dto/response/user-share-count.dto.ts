/** Users with most shared resources response model */
export class UserShareCountDto {
  userId!: string;
  username!: string;
  email!: string;
  fullName!: string;
  shareCount!: number;
}
