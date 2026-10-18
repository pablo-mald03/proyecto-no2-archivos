import { RoleResponseDto } from "./role-response.dto";

/*Role full detail model */
export class RoleDetailResponseDto extends RoleResponseDto {
  permissions!: string[];           
  deactivatedAt!: Date | null;
  updatedAt!: Date;
}