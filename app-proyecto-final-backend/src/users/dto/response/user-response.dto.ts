import { ApiProperty } from "@nestjs/swagger";
import { UserStorageResponseDto } from "./user-storage-response.dto";
import { PageResponseDto } from "src/common/dto/page-response.dto";


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

//Api documentation
export class PaginatedUsersResponseDto extends PageResponseDto<UserResponseDto> {
  @ApiProperty({ type: [UserResponseDto] })
  declare content: UserResponseDto[];
}