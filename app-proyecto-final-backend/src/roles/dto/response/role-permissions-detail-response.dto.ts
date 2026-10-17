import { PermissionResponseDto } from "src/permissions/dto/response/permission-response.dto";

/*Role permissions response dto model class */
export class RolePermissionsResponseDto {
  roleId!: string; 
  roleCode!: string; 
  permissions!: PermissionResponseDto[];
}