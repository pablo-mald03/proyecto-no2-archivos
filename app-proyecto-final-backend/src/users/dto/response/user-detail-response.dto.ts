import { UserResponseDto } from "./user-response.dto";

/*User detail response dto class */
export class UserDetailResponseDto extends UserResponseDto {
  permissions!: string[];            // codes embedded in the role
  deactivatedAt!: Date | null;
  updatedAt!: Date;
}