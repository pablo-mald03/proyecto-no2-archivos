import { Injectable } from "@nestjs/common";
import { PermissionsRepository } from "../repository/permissions.repository";
import { ListPermissionsQueryDto } from "../dto/request/list-permission-query.dto";
import { PageResponseDto } from "src/common/dto/page-response.dto";
import { PermissionResponseDto } from "../dto/response/permission-response.dto";
import { PermissionMapper } from "../mapper/permissions.mapper";
import { PermissionCatalogResponseDto } from "../dto/response/permission-catalog-response.dto";
import { PermissionDocument } from "../entities/permission.entity";
import { InvalidRolePermissionsException } from "src/roles/exceptions/invalid-role-permission.exception";

//Principal permission service
@Injectable()
export class PermissionsService {
  constructor(private readonly permissions: PermissionsRepository) { }

  //Method to find all permissions
  async findAll(query: ListPermissionsQueryDto): Promise<PageResponseDto<PermissionResponseDto>> {
    const { content, total } = await this.permissions.findPage(
      { module: query.module, search: query.search }, query);
    return PageResponseDto.of(content.map(PermissionMapper.toResponse), total, query);
  }

  //Method to get the distinct modules of the permissions catalog
  async getCatalog(): Promise<PermissionCatalogResponseDto> {
    return { modules: await this.permissions.findModules() };
  }

  //Method to get all permissions codes
  async getAllCodes(): Promise<string[]> {
    return (await this.permissions.findAll()).map((p) => p.code);
  }

  //Method to get permissions by codes
  getByCodes(codes: string[]): Promise<PermissionDocument[]> {
    return this.permissions.findByCodes(codes);
  }

  //Method to validate that all permissions exist
  async resolveOrFail(codes: string[]): Promise<PermissionDocument[]> {
    const found = await this.permissions.findByCodes(codes);
    const known = new Set(found.map((p) => p.code));
    const unknown = codes.filter((c) => !known.has(c));
    if (unknown.length) throw new InvalidRolePermissionsException(`Permisos inexistentes: ${unknown.join(', ')}`);
    return found;
  }
}