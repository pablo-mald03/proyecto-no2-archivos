import { RoleDocument } from "src/roles/entities/role.entity";
import { UserDocument } from "../entities/user.entity";
import { UserResponseDto } from "../dto/response/user-response.dto";
import { UserDetailResponseDto } from "../dto/response/user-detail-response.dto";
import { UserStorageResponseDto } from "../dto/response/user-storage-response.dto";

//User mapper class
export class UserMapper {

  //Method to map the user entity to domain
  static toResponse(user: UserDocument, role: RoleDocument): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roleCode: role.code,
      roleName: role.name,
      storage: { quotaBytes: user.storage.quotaBytes, usedBytes: user.storage.usedBytes },
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  //Method to map the user detail entity to response
  static toDetail(user: UserDocument, role: RoleDocument): UserDetailResponseDto {
    return {
      ...UserMapper.toResponse(user, role),
      permissions: [...role.permissions],
      deactivatedAt: user.deactivatedAt,
      updatedAt: user.updatedAt,
    };
  }

  //Method to map the user storage to response
  static toStorage(user: UserDocument): UserStorageResponseDto {
    return {
      quotaBytes: user.storage.quotaBytes,
      usedBytes: user.storage.usedBytes,
    };
  }

}