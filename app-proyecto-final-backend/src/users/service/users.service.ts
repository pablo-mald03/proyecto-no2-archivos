import { Injectable } from '@nestjs/common';
import { UserDocument } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../repository/users.repository';
import { RolesService } from 'src/roles/service/roles.service';
import { PasswordService } from 'src/password/service/password.service';
import { RefreshTokensRepository } from 'src/refresh-tokens/repository/refresh-tokens.repository';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { CreateUserDto, UpdateUserDto } from '../dto/request/create-user.dto';
import { AuthUser } from '../models/auth-user.model';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UserDetailResponseDto } from '../dto/response/user-detail-response.dto';
import { UserMapper } from '../mapper/users.mapper';
import { ListUsersQueryDto } from '../dto/request/list-users-query.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { AssignRoleDto } from '../dto/request/assign-role.dto';
import { ChangeUserStatusDto } from '../dto/request/change-user-status.dto';
import { UpdateQuotaDto } from '../dto/request/update-quota.dto';
import { InvalidQuotaException } from '../exceptions/invalid-quota.exception';
import { ChangePasswordDto } from '../dto/request/change-password.dto';
import { InvalidPasswordChangeException } from '../exceptions/invalid-password-change.exception';
import { RoleDocument } from 'src/roles/entities/role.entity';
import { RoleNotFoundException } from 'src/roles/exceptions/role-not-found.exception';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { SelfActionNotAllowedException } from '../exceptions/self-action-not-allowed.exception';
import { ActivityMetadataEntity } from 'src/activity/entities/activity-metadata.entity';
import { SystemRole } from 'src/common/constants/validation/system-roles';
import { LastAdminException } from '../exceptions/last-admin.exception';
import { ResourceType } from 'src/common/constants/actions/resource-type';
import { SettingKey } from 'src/common/constants/validation/setting-key';
import { SystemSettingsService } from 'src/system-settings/service/system-settings.service';
import { RegisterUserDto } from '../dto/request/register-user.dto';
import { RecoverPasswordDto } from '../dto/request/recovery-password.dto';
import { InvalidRecoveryDataException } from '../exceptions/invalid-recovery-data.exception';

/*Principal user service class */
@Injectable()
export class UsersService {

  constructor(
    private readonly users: UsersRepository,
    private readonly roles: RolesService,
    private readonly passwords: PasswordService,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly activity: ActivityRecorderService,
    private readonly settings: SystemSettingsService,
  ) { }


  /*Principal method to create a new user */
  async create(dto: CreateUserDto, actor: AuthUser): Promise<UserDetailResponseDto> {
    const roleCode = dto.roleCode ?? (await this.settings.getString(SettingKey.USERS_DEFAULT_ROLE_CODE));
    const role = await this.roles.getAssignableByCodeOrFail(roleCode);
    const user = await this.createUser(dto, role);

    this.log(actor, ActivityAction.USER_CREATED, user, `Creó al usuario ${user.username}`);
    return UserMapper.toDetail(user, role);
  }

  /* Principal method to recover the password  */
  async recoverPassword(dto: RecoverPasswordDto): Promise<void> {
    if (dto.password !== dto.confirmationPassword) {
      throw new InvalidPasswordChangeException({ confirmationPassword: 'Las contraseñas no coinciden' });
    }

    const user = await this.users.findByUsername(dto.username);

    if (!user || !user.isActive || user.email !== dto.email) {
      throw new InvalidRecoveryDataException();
    }

    await this.users.setPasswordHash(user.id, await this.passwords.hash(dto.password));
    await this.refreshTokens.revokeAllByUserId(user.id);
    this.log(user, ActivityAction.USER_PASSWORD_RECOVERED, user, 'Recuperó su contraseña');
  }



  /*Principal method for the public self-registration: the role is always USER*/
  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    const role = await this.roles.getAssignableByCodeOrFail(SystemRole.USER);
    const user = await this.createUser(dto, role);

    this.log(user, ActivityAction.USER_REGISTERED, user, 'Se registró en la plataforma'); // the new user is the actor
    return UserMapper.toResponse(user, role);
  }

  /*Helper method shared by create and register: uniqueness, hash, default quota and persistence*/
  private async createUser(dto: RegisterUserDto, role: RoleDocument): Promise<UserDocument> {
    await this.assertUnique(dto.email, dto.username);
    return this.users.create({
      username: dto.username,
      email: dto.email,
      passwordHash: await this.passwords.hash(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleId: role._id,
      storage: { quotaBytes: await this.settings.getNumber(SettingKey.STORAGE_DEFAULT_QUOTA_BYTES), usedBytes: 0 },
    });
  }

  /*Principal method to fetch all registered users */
  async findAll(query: ListUsersQueryDto): Promise<PageResponseDto<UserResponseDto>> {
    const role = query.roleCode ? await this.roles.getByCodeOrFail(query.roleCode) : undefined;
    const { content, total } = await this.users.findPage(
      { search: query.search, isActive: query.isActive, roleId: role?._id }, query);

    const roleMap = await this.roles.getMapByIds([...new Set(content.map((u) => u.roleId.toString()))]);
    const items = content.map((u) => UserMapper.toResponse(u, this.roleOf(roleMap, u)));
    return PageResponseDto.of(items, total, query);
  }

   /*Principal method to fetch all registered users */
  async findAllUsers(query: ListUsersQueryDto): Promise<PageResponseDto<UserResponseDto>> {
    const role = await this.roles.getByCodeOrFail('USER');
    const { content, total } = await this.users.findPage(
      { search: query.search, isActive: query.isActive, roleId: role?._id }, query);

    const roleMap = await this.roles.getMapByIds([...new Set(content.map((u) => u.roleId.toString()))]);
    const items = content.map((u) => UserMapper.toResponse(u, this.roleOf(roleMap, u)));
    return PageResponseDto.of(items, total, query);
  }


  /*Principal method to fetch an user by id*/
  async findById(id: string): Promise<UserDetailResponseDto> {
    const user = await this.getOrFail(id);
    return UserMapper.toDetail(user, await this.roles.getByIdOrFail(user.roleId));
  }

  /*Principal method to update an user */
  async update(id: string, dto: UpdateUserDto, actor: AuthUser): Promise<UserDetailResponseDto> {
    const user = await this.getOrFail(id);
    const changesEmail = dto.email !== undefined && dto.email !== user.email;
    const changesUsername = dto.username !== undefined && dto.username !== user.username;
    await this.assertUnique(changesEmail ? dto.email : undefined, changesUsername ? dto.username : undefined, id);

    const updated = await this.users.updateProfile(id, dto);
    if (!updated) throw new UserNotFoundException();

    this.log(actor, ActivityAction.USER_UPDATED, updated, `Actualizó los datos del usuario ${updated.username}`);
    return UserMapper.toDetail(updated, await this.roles.getByIdOrFail(updated.roleId));
  }

  /**
   * Principal method to update current authenticated user profile
   */
  async updateProfileSelf(actor: AuthUser, dto: UpdateUserDto): Promise<UserDetailResponseDto> {
    const user = await this.getOrFail(actor.id);

    const changesEmail = dto.email !== undefined && dto.email !== user.email;
    const changesUsername = dto.username !== undefined && dto.username !== user.username;

    await this.assertUnique(
      changesEmail ? dto.email : undefined,
      changesUsername ? dto.username : undefined,
      actor.id
    );

    const updated = await this.users.updateProfile(actor.id, dto);
    if (!updated) throw new UserNotFoundException();

    this.log(actor, ActivityAction.USER_UPDATED, updated, `Actualizó su propio perfil (${updated.username})`);
    return UserMapper.toDetail(updated, await this.roles.getByIdOrFail(updated.roleId));
  }

  /*Principal method to assign a role to an user */
  async assignRole(id: string, dto: AssignRoleDto, actor: AuthUser): Promise<UserDetailResponseDto> {
    this.assertNotSelf(id, actor, 'No puedes cambiar tu propio rol');
    const user = await this.getOrFail(id);
    const newRole = await this.roles.getAssignableByCodeOrFail(dto.roleCode);
    if (user.roleId.equals(newRole._id)) return UserMapper.toDetail(user, newRole);

    await this.assertNotLastAdmin(user);
    const updated = await this.users.setRole(id, newRole._id);
    if (!updated) throw new UserNotFoundException();

    this.log(actor, ActivityAction.USER_ROLE_CHANGED, updated,
      `Cambió el rol de ${updated.username} a ${newRole.name}`);
    return UserMapper.toDetail(updated, newRole);
  }

  /*Principal method to change the status of an user */
  async changeStatus(id: string, dto: ChangeUserStatusDto, actor: AuthUser): Promise<UserDetailResponseDto> {
    this.assertNotSelf(id, actor, 'No puedes cambiar tu propio estado');
    const user = await this.getOrFail(id);
    const role = await this.roles.getByIdOrFail(user.roleId);
    if (user.isActive === dto.isActive) return UserMapper.toDetail(user, role);

    if (!dto.isActive) await this.assertNotLastAdmin(user);
    const updated = await this.users.setActive(id, dto.isActive);
    if (!updated) throw new UserNotFoundException();

    if (!dto.isActive) await this.refreshTokens.revokeAllByUserId(id);

    this.log(actor, dto.isActive ? ActivityAction.USER_ACTIVATED : ActivityAction.USER_DEACTIVATED, updated,
      `${dto.isActive ? 'Activó' : 'Desactivó'} al usuario ${updated.username}`);
    return UserMapper.toDetail(updated, role);
  }

  /*Principal method to update the storage quota of an user */
  async updateQuota(id: string, dto: UpdateQuotaDto, actor: AuthUser): Promise<UserDetailResponseDto> {
    const user = await this.getOrFail(id);
    if (dto.quotaBytes < user.storage.usedBytes) throw new InvalidQuotaException();

    const previous = user.storage.quotaBytes;
    const updated = await this.users.setQuota(id, dto.quotaBytes);
    if (!updated) throw new UserNotFoundException();

    this.log(actor, ActivityAction.USER_QUOTA_CHANGED, updated,
      `Cambió la cuota de almacenamiento de ${updated.username}`,
      { previousSizeBytes: previous, sizeBytes: dto.quotaBytes });
    return UserMapper.toDetail(updated, await this.roles.getByIdOrFail(updated.roleId));
  }

  /*Principal method to change the password of an user */
  async changePassword(actor: AuthUser, dto: ChangePasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmationPassword) {
      throw new InvalidPasswordChangeException({ confirmationPassword: 'Las contraseñas no coinciden' });
    }

    const user = await this.users.findByIdWithPassword(actor.id);
    if (!user) throw new UserNotFoundException();
    if (!(await this.passwords.compare(dto.currentPassword, user.passwordHash))) {
      throw new InvalidPasswordChangeException({ currentPassword: 'La contraseña actual es incorrecta' });
    }

    await this.users.setPasswordHash(actor.id, await this.passwords.hash(dto.newPassword));
    await this.refreshTokens.revokeAllByUserId(actor.id);

    this.log(actor, ActivityAction.USER_PASSWORD_CHANGED, user, 'Cambió su contraseña');
  }

  /*Helper method to get an user by id*/
  private async getOrFail(id: string): Promise<UserDocument> {
    const user = await this.users.findById(id);
    if (!user) throw new UserNotFoundException();
    return user;
  }

  /*Helper method to get a role by id*/
  private roleOf(map: Map<string, RoleDocument>, user: UserDocument): RoleDocument {
    const role = map.get(user.roleId.toString());
    if (!role) throw new RoleNotFoundException();
    return role;
  }

  /*Helper method to assert that an email and username are unique*/
  private async assertUnique(email?: string, username?: string, excludeId?: string): Promise<void> {
    const [emailTaken, usernameTaken] = await Promise.all([
      email ? this.users.existsByEmail(email, excludeId) : false,
      username ? this.users.existsByUsername(username, excludeId) : false,
    ]);
    const errors: Record<string, string> = {};
    if (emailTaken) errors.email = 'El correo ya está registrado';
    if (usernameTaken) errors.username = 'El nombre de usuario ya está en uso';
    if (Object.keys(errors).length) throw new UserAlreadyExistsException(errors);
  }

  /*Helper method to assert that an action is not performed by the same user*/
  private assertNotSelf(id: string, actor: AuthUser, message: string): void {
    if (id === actor.id) throw new SelfActionNotAllowedException(message);
  }

  /*Helper method to assert that an action is not performed by the last admin*/
  private async assertNotLastAdmin(user: UserDocument): Promise<void> {
    if (!user.isActive) return;
    const admin = await this.roles.getByCodeOrFail(SystemRole.ADMIN);
    if (!user.roleId.equals(admin._id)) return;
    if ((await this.users.countActiveByRoleId(admin._id)) <= 1) throw new LastAdminException();
  }

  /*Helper method to log an action performed by an user*/
  private log(actor: Pick<AuthUser, 'id' | 'username' | 'email'>, action: ActivityAction, target: UserDocument,
    description: string, metadata?: ActivityMetadataEntity): void {
    this.activity.record({
      actor, action, description, metadata,
      resource: { type: ResourceType.USER, id: target.id, name: target.username },
    });
  }
}