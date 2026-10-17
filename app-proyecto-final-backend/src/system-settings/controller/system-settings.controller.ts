import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Permission } from "src/common/constants/permissions/permissions";
import { RequirePermissions } from "src/common/decorators/require-permissions.decorator";
import { SystemSettingsService } from "../service/system-settings.service";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { UpdateSettingDto } from "../dto/request/update-setting.dto";
import type { AuthUser } from "src/users/models/auth-user.model";

//Settings controller
@ApiTags('Settings')
@Controller('settings')
export class SystemSettingsController {
    constructor(private readonly settings: SystemSettingsService) { }

    //Principal endpoint to get all permissions
    @Get()
    @RequirePermissions(Permission.SETTINGS_VIEW)
    @ApiOperation({ summary: 'List the general rules of the system' })
    findAll() {
        return this.settings.findAll();
    }

    //Principal endpoint to update the setting
    @Patch(':key')
    @RequirePermissions(Permission.SETTINGS_UPDATE)
    @ApiOperation({ summary: 'Update the value of a general rule' })
    update(@Param('key') key: string, @Body() dto: UpdateSettingDto, @CurrentUser() actor: AuthUser) {
        return this.settings.update(key, dto, actor);
    }
}
