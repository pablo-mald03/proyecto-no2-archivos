import { RoleDetailResponseDto } from "../dto/response/role-detail-responsel.dto";
import { RoleResponseDto } from "../dto/response/role-response.dto";
import { RoleDocument } from "../entities/role.entity";

/*Role mapper class */
export class RoleMapper {
    //Mapper from entity to domain
    static toResponse(r: RoleDocument): RoleResponseDto {
        return {
            id: r.id, code: r.code, name: r.name, description: r.description,
            isSystem: r.isSystem, isActive: r.isActive,
            permissionsCount: r.permissions.length, createdAt: r.createdAt,
        };
    }

    //Mapper from entity to domain respose with details
    static toDetail(r: RoleDocument): RoleDetailResponseDto {
        return {
            ...RoleMapper.toResponse(r), permissions: [...r.permissions],
            deactivatedAt: r.deactivatedAt, updatedAt: r.updatedAt
        };
    }
}