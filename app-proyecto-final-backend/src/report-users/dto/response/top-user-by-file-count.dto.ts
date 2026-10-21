/** Top user by file count response model */
export class TopUserByFileCountDto {
  userId!: string;
  username!: string;
  email!: string;
  fullName!: string;
  fileCount!: number;
}
