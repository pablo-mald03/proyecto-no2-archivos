import { PermissionResponseDto } from "../dto/response/permission-response.dto";
import { PermissionDocument } from "../entities/permission.entity";

//Principal permission mapper class
export class PermissionMapper {

    //Method to map the permission response entity to domain
    static toResponse(p: PermissionDocument): PermissionResponseDto {
        return { code: p.code, module: p.module, name: p.name, description: p.description };
    }
}