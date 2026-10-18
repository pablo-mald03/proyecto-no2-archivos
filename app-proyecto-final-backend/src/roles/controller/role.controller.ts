import { Body, Controller, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesAdminService } from "../service/role-admin.service";
import { RequirePermissions } from "src/common/decorators/require-permissions.decorator";
import { Permission } from "src/common/constants/permissions/permissions";
import { CreateRoleDto } from "../dto/request/create-role.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import type { AuthUser } from "src/users/models/auth-user.model";
import { ListRolesQueryDto } from "../dto/request/list-roles-query.dto";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { UpdateRolePermissionsDto } from "../dto/request/update-role-permissions.dto";
import { UpdateRoleDto } from "../dto/request/update-role.dto";
import { ChangeRoleStatusDto } from "../dto/request/change-role-status.dto";
import { PaginatedRolesResponseDto } from "../dto/response/role-response.dto";

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesAdminService) { }

  /*Principal endpoint for creating a role*/
  @Post()
  @RequirePermissions(Permission.ROLES_CREATE)
  @ApiOperation({ summary: 'Create a role with a specific combo of permissions' })
  create(@Body() dto: CreateRoleDto, @CurrentUser() actor: AuthUser) {
    return this.roles.create(dto, actor);
  }

  /*Principal endpoint for listing roles*/
  @Get()
  @RequirePermissions(Permission.ROLES_VIEW)
  @ApiOperation({ summary: 'List roles with pagination and filters' })
  @ApiOkResponse({ type: PaginatedRolesResponseDto })
  findAll(@Query() query: ListRolesQueryDto) {
    return this.roles.findAll(query);
  }

  /*Principal endpoint for finding a role by its ID*/
  @Get(':id')
  @RequirePermissions(Permission.ROLES_VIEW)
  @ApiOperation({ summary: 'Get the detail of a role' })
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.roles.findById(id);
  }

  /*Principal endpoint for getting a role's permissions*/
  @Get(':id/permissions')
  @RequirePermissions(Permission.ROLES_VIEW)
  @ApiOperation({ summary: 'Get the permissions of a role' })
  getPermissions(@Param('id', ParseObjectIdPipe) id: string) {
    return this.roles.getPermissions(id);
  }

  /*Principal endpoint for updating a role's permissions*/
  @Put(':id/permissions')
  @RequirePermissions(Permission.ROLES_PERMISSIONS_UPDATE)
  @ApiOperation({ summary: 'Replace the whole combo of permissions of a role' })
  updatePermissions(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser() actor: AuthUser) {
    return this.roles.updatePermissions(id, dto, actor);
  }

  /*Principal endpoint for updating a role's information*/
  @Patch(':id/role')
  @RequirePermissions(Permission.ROLES_UPDATE)
  @ApiOperation({ summary: 'Update the name and description of a role' })
  updateInfo(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateRoleDto, @CurrentUser() actor: AuthUser) {
    return this.roles.updateInfo(id, dto, actor);
  }

  /*Principal endpoint for changing a role's status*/
  @Patch(':id/status')
  @RequirePermissions(Permission.ROLES_DELETE)
  @ApiOperation({ summary: 'Activate or deactivate a role (soft delete)' })
  changeStatus(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: ChangeRoleStatusDto,
    @CurrentUser() actor: AuthUser) {
    return this.roles.changeStatus(id, dto, actor);
  }
}

