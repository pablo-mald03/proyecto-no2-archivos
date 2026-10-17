import { Injectable } from "@nestjs/common";
import { SystemSettingsRepository } from "../repository/system-settings.repository";
import { RolesService } from "src/roles/service/roles.service";
import { ActivityRecorderService } from "src/activity/service/activity-recorder.service";
import { SettingResponseDto } from "../dto/response/setting-response.dto";
import { UpdateSettingDto } from "../dto/request/update-setting.dto";
import { AuthUser } from "src/users/models/auth-user.model";
import { SettingNotFoundException } from "../exceptions/setting-not-foung.exception";
import { ActivityAction } from "src/common/constants/activity-action";
import { SettingKey } from "src/common/constants/setting-key";
import { InvalidSettingValueException } from "../exceptions/invalid-setting-value.exception";
import { SystemSettingDocument } from "../entities/system-setting.entity";
import { SystemSettingMapper } from "../mapper/system-setting.mapper";
import { ResourceType } from "src/common/constants/resource-type";

/*Service for manage system settings*/
@Injectable()
export class SystemSettingsService {
  constructor(
    private readonly settings: SystemSettingsRepository,
    private readonly roles: RolesService,
    private readonly activity: ActivityRecorderService,
  ) { }

  /*Principal method to return all the settings */
  async findAll(): Promise<SettingResponseDto[]> {
    return (await this.settings.findAll()).map(SystemSettingMapper.toResponse);
  }

  /*Principal method to update a setting */
  async update(key: string, dto: UpdateSettingDto, actor: AuthUser): Promise<SettingResponseDto> {
    const current = await this.getOrFail(key);
    const value = await this.validate(current.key, dto.value);
    if (value === current.value) return SystemSettingMapper.toResponse(current); // nothing to change

    const updated = await this.settings.updateValue(key, value, actor.id);
    if (!updated) throw new SettingNotFoundException();

    this.activity.record({
      actor,
      action: ActivityAction.SETTING_UPDATED,
      resource: { type: ResourceType.SETTING, id: updated.id, name: updated.key },
      description: `Cambió la regla «${updated.key}» de ${String(current.value)} a ${String(updated.value)}`,
    });
    return SystemSettingMapper.toResponse(updated);
  }

  /*Method to get a setting value as number*/
  async getNumber(key: SettingKey): Promise<number> {
    const { value } = await this.getOrFail(key);
    if (typeof value !== 'number') throw new InvalidSettingValueException('La regla almacenada no es numérica');
    return value;
  }

  /*Method to get a setting value as string*/
  async getString(key: SettingKey): Promise<string> {
    const { value } = await this.getOrFail(key);
    if (typeof value !== 'string') throw new InvalidSettingValueException('La regla almacenada no es texto');
    return value;
  }

  /*Method to get a setting value or throw an exception if not found*/
  private async getOrFail(key: string): Promise<SystemSettingDocument> {
    const setting = await this.settings.findByKey(key);
    if (!setting) throw new SettingNotFoundException();
    return setting;
  }

  /*Method to validate the request */
  private async validate(key: string, value: unknown): Promise<string | number> {
    switch (key) {
      case SettingKey.STORAGE_DEFAULT_QUOTA_BYTES: {
        if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
          throw new InvalidSettingValueException('La cuota debe ser un número entero de bytes mayor a cero');
        }
        return value;
      }
      case SettingKey.USERS_DEFAULT_ROLE_CODE: {
        if (typeof value !== 'string') throw new InvalidSettingValueException('El rol debe ser un texto');
        const code = value.trim().toUpperCase();
        await this.roles.getAssignableByCodeOrFail(code);
        return code;
      }
      default:
        throw new InvalidSettingValueException('Esta regla no se puede modificar');
    }
  }
}