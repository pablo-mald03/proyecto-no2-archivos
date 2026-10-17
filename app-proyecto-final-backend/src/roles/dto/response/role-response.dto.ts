/*Role response dto */
export class RoleResponseDto {
  id!: string; code!: string; 
  name!: string; 
  description!: string;
  isSystem!: boolean;
  isActive!: boolean; 
  permissionsCount!: number; 
  createdAt!: Date;
}