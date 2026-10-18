import { ApiProperty } from "@nestjs/swagger";
import { PageResponseDto } from "src/common/dto/page-response.dto";

/*Principal permission response dto model */
export class PermissionResponseDto { 
    code!: string; 
    module!: string; 
    name!: string; 
    description!: string; 
}

//Api documentation
export class PaginatedPermissionResponseDto extends PageResponseDto<PermissionResponseDto> {
  @ApiProperty({ type: [PermissionResponseDto] })
  declare content: PermissionResponseDto[];
}