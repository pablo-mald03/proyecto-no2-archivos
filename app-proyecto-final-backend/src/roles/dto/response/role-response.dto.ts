import { ApiProperty } from "@nestjs/swagger";
import { PageResponseDto } from "src/common/dto/page-response.dto";

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

export class PaginatedRolesResponseDto extends PageResponseDto<RoleResponseDto> {
  @ApiProperty({ type: [RoleResponseDto] })
  declare content: RoleResponseDto[];
}