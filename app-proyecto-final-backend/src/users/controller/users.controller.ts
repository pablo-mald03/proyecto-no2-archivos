import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/request/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from '../models/auth-user.model';
import { ListUsersQueryDto } from '../dto/request/list-users-query.dto';
import { ChangePasswordDto } from '../dto/request/change-password.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { AssignRoleDto } from '../dto/request/assign-role.dto';
import { ChangeUserStatusDto } from '../dto/request/change-user-status.dto';
import { UpdateQuotaDto } from '../dto/request/update-quota.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) { }

  @Post()
  @RequirePermissions(Permission.USERS_CREATE)
  @ApiOperation({ summary: 'Register a new user' })
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthUser) {
    return this.users.create(dto, actor);
  }

  @Get()
  @RequirePermissions(Permission.USERS_VIEW)
  @ApiOperation({ summary: 'List users with pagination and filters' })
  findAll(@Query() query: ListUsersQueryDto) {
    return this.users.findAll(query);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get the full profile of the current user' })
  profile(@CurrentUser() actor: AuthUser) {
    return this.users.findById(actor.id);
  }

  @Patch('profile/password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Change the password of the current user' })
  changePassword(@CurrentUser() actor: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(actor, dto);
  }

  @Get(':id')
  @RequirePermissions(Permission.USERS_VIEW)
  @ApiOperation({ summary: 'Get the detail of a user' })
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.users.findById(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.USERS_UPDATE)
  @ApiOperation({ summary: 'Update the data of a user' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: AuthUser) {
    return this.users.update(id, dto, actor);
  }

  @Patch(':id/role')
  @RequirePermissions(Permission.USERS_ASSIGN_ROLE)
  @ApiOperation({ summary: 'Change the role of a user' })
  assignRole(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: AssignRoleDto, @CurrentUser() actor: AuthUser) {
    return this.users.assignRole(id, dto, actor);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.USERS_CHANGE_STATUS)
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  changeStatus(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: ChangeUserStatusDto, @CurrentUser() actor: AuthUser) {
    return this.users.changeStatus(id, dto, actor);
  }

  @Patch(':id/quota')
  @RequirePermissions(Permission.USERS_QUOTA_UPDATE)
  @ApiOperation({ summary: 'Change the storage quota of a user' })
  updateQuota(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateQuotaDto, @CurrentUser() actor: AuthUser) {
    return this.users.updateQuota(id, dto, actor);
  }
}