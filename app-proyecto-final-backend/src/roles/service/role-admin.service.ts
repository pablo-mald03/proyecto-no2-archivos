import { Injectable } from "@nestjs/common";
import { RolesRepository } from "../repository/roles.repository";
import { RolesService } from "./roles.service";
import { PermissionsService } from "src/permissions/service/permission.service";
import { UsersRepository } from "src/users/repository/users.repository";
import { ActivityRecorderService } from "src/activity/service/activity-recorder.service";
import { CreateRoleDto } from "../dto/request/create-role.dto";
import { AuthUser } from "src/users/models/auth-user.model";
import { RoleDetailResponseDto } from "../dto/response/role-detail-responsel.dto";
import { RoleAlreadyExistsException } from "../exceptions/role-already-exists.exception";
import { ActivityAction } from "src/common/constants/actions/activity-action";
import { RoleMapper } from "../mapper/role.mapper";
import { ListRolesQueryDto } from "../dto/request/list-roles-query.dto";
import { PageResponseDto } from "src/common/dto/page-response.dto";
import { RoleResponseDto } from "../dto/response/role-response.dto";
import { RolePermissionsResponseDto } from "../dto/response/role-permissions-detail-response.dto";
import { UpdateRolePermissionsDto } from "../dto/request/update-role-permissions.dto";
import { RoleNotFoundException } from "../exceptions/role-not-found.exception";
import { UpdateRoleDto } from "../dto/request/update-role.dto";
import { ChangeRoleStatusDto } from "../dto/request/change-role-status.dto";
import { RoleProtectedException } from "../exceptions/role-protected.exception";
import { RoleInUseException } from "../exceptions/role-in-use.exception";
import { RoleDocument } from "../entities/role.entity";
import { PermissionMapper } from "src/permissions/mapper/permissions.mapper";
import { InvalidRolePermissionsException } from "../exceptions/invalid-role-permission.exception";
import { EDIT_SUFFIXES } from "../constants/edit-suffixes";
import { SystemRole } from "src/common/constants/validation/system-roles";
import { Permission } from "src/common/constants/permissions/permissions";
import { ResourceType } from "src/common/constants/actions/resource-type";

/*Principal role admin management service */
@Injectable()
export class RolesAdminService {
    constructor(
        private readonly repo: RolesRepository,
        private readonly roles: RolesService,
        private readonly permissions: PermissionsService,
        private readonly users: UsersRepository,
        private readonly activity: ActivityRecorderService,
    ) { }

    /*Principal method for creating a role, validates the role code and permissions*/
    async create(dto: CreateRoleDto, actor: AuthUser): Promise<RoleDetailResponseDto> {
        if (await this.repo.existsByCode(dto.code)) throw new RoleAlreadyExistsException();
        const permissions = await this.validatePermissions(dto.permissions);

        const role = await this.repo.create({
            code: dto.code, name: dto.name, description: dto.description ?? '', permissions,
        });

        this.log(actor, ActivityAction.ROLE_CREATED, role, `Creo el rol ${role.code}`);
        return RoleMapper.toDetail(role);
    }

    /*Principal method for listing all roles with pagination and filters*/
    async findAll(query: ListRolesQueryDto): Promise<PageResponseDto<RoleResponseDto>> {
        const { content, total } = await this.repo.findPage(
            { search: query.search, isActive: query.isActive }, query);
        return PageResponseDto.of(content.map(RoleMapper.toResponse), total, query);
    }

    /*Principal method for finding a role by its ID*/
    async findById(id: string): Promise<RoleDetailResponseDto> {
        return RoleMapper.toDetail(await this.roles.getByIdOrFail(id));
    }

    /*Principal method for getting a role's permissions by its ID*/
    async getPermissions(id: string): Promise<RolePermissionsResponseDto> {
        return this.permissionsOf(await this.roles.getByIdOrFail(id));
    }

    /*Principal method for updating a role's permissions by its ID*/
    async updatePermissions(id: string, dto: UpdateRolePermissionsDto, actor: AuthUser): Promise<RolePermissionsResponseDto> {
        const role = await this.roles.getByIdOrFail(id);
        this.assertNotSystem(role);
        const permissions = await this.validatePermissions(dto.permissions);

        const added = permissions.filter((c) => !role.permissions.includes(c));
        const removed = role.permissions.filter((c) => !permissions.includes(c));
        if (!added.length && !removed.length) return this.permissionsOf(role);

        const updated = await this.repo.setPermissions(id, permissions);
        if (!updated) throw new RoleNotFoundException();

        this.log(actor, ActivityAction.ROLE_PERMISSIONS_CHANGED, updated,
            `Actualizó los permisos del rol ${updated.code}: se agregaron ${added.length} y se quitaron ${removed.length}`);
        return this.permissionsOf(updated);
    }

    /*Principal method for updating a role's information by its ID*/
    async updateInfo(id: string, dto: UpdateRoleDto, actor: AuthUser): Promise<RoleDetailResponseDto> {
        const role = await this.roles.getByIdOrFail(id);
        this.assertNotSystem(role);
        if (dto.name === undefined && dto.description === undefined) return RoleMapper.toDetail(role);

        const updated = await this.repo.updateInfo(id, dto);
        if (!updated) throw new RoleNotFoundException();

        this.log(actor, ActivityAction.ROLE_UPDATED, updated, `Actualizó los datos del rol ${updated.code}`);
        return RoleMapper.toDetail(updated);
    }


    /*Principal method for changing a role's status by its ID*/
    async changeStatus(id: string, dto: ChangeRoleStatusDto, actor: AuthUser): Promise<RoleDetailResponseDto> {
        const role = await this.roles.getByIdOrFail(id);
        this.assertNotSystem(role);
        if (role.isActive === dto.isActive) return RoleMapper.toDetail(role);

        if (!dto.isActive) {
            const assigned = await this.users.countByRoleId(role._id);
            if (assigned > 0) throw new RoleInUseException(assigned);
        }

        const updated = await this.repo.setActive(id, dto.isActive);
        if (!updated) throw new RoleNotFoundException();

        this.log(actor, dto.isActive ? ActivityAction.ROLE_ACTIVATED : ActivityAction.ROLE_DEACTIVATED, updated,
            `${dto.isActive ? 'Activó' : 'Desactivó'} el rol ${updated.code}`);
        return RoleMapper.toDetail(updated);
    }

    /*Helper method for getting a role's permissions by its ID*/
    private async permissionsOf(role: RoleDocument): Promise<RolePermissionsResponseDto> {
        const docs = await this.permissions.getByCodes(role.permissions);
        docs.sort((a, b) => a.module.localeCompare(b.module) || a.code.localeCompare(b.code));
        return { roleId: role.id, roleCode: role.code, permissions: docs.map(PermissionMapper.toResponse) };
    }

    /*Helper method for validating permissions*/
    private async validatePermissions(codes: string[]): Promise<string[]> {
        const unique = [...new Set(codes)];

        if (unique.includes(Permission.DRIVE_ACCESS)) {
            throw new InvalidRolePermissionsException(
                `${Permission.DRIVE_ACCESS} está reservado al rol ${SystemRole.USER} y no se puede asignar a otros roles`);
        }

        const found = await this.permissions.resolveOrFail(unique);

        const selected = new Set(unique);
        const missingView = found
            .filter((p) => EDIT_SUFFIXES.some((s) => p.code.endsWith(s)) && !selected.has(`${p.module}_VIEW`))
            .map((p) => `${p.code} requiere ${p.module}_VIEW`);
        if (missingView.length) throw new InvalidRolePermissionsException(missingView.join('; '));

        return unique;
    }


    /*Helper method for protecting the system roles*/
    private assertNotSystem(role: RoleDocument): void {
        if (role.isSystem) {
            throw new RoleProtectedException(`El rol ${role.code} es un rol del sistema y no se puede modificar`);
        }
    }

    /*Helper method for logging activities*/
    private log(actor: AuthUser, action: ActivityAction, target: RoleDocument, description: string): void {
        this.activity.record({
            actor, action, description,
            resource: { type: ResourceType.ROLE, id: target.id, name: target.code },
        });
    }
}