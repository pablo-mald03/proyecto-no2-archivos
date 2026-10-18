import { PermissionResponseDto } from "./permission-response.dto";

//Principal permisson module group dto
export class PermissionModuleGroupDto { 
    module!: string; 
    permissions!: PermissionResponseDto[]; 
}

//Principal permission catalog response dto
//Principal permission catalog response dto
export class PermissionCatalogResponseDto {
    modules!: string[];
}