import { UserStorageResponseDto } from "./user-storage-response.dto";


/*User response dto class */
export class UserResponseDto {
  id!: string;
  username!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  isActive!: boolean;
  roleCode!: string;
  roleName!: string;
  storage!: UserStorageResponseDto;
  lastLoginAt!: Date | null;
  createdAt!: Date;
}