import { SettingResponseDto } from "../dto/response/setting-response.dto";
import { SystemSettingDocument } from "../entities/system-setting.entity";

//Principal mapper class for the system setting
export class SystemSettingMapper {
  static toResponse(s: SystemSettingDocument): SettingResponseDto {
    return { key: s.key, value: s.value, description: s.description,
             updatedBy: s.updatedBy?.toString() ?? null, updatedAt: s.updatedAt };
  }
}