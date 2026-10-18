import { Module } from "@nestjs/common";
import { SystemSettingEntity, SystemSettingSchema } from "./entities/system-setting.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { RolesModule } from "src/roles/roles.module";
import { ActivityModule } from "src/activity/activity.module";
import { SystemSettingsService } from "./service/system-settings.service";
import { SystemSettingsRepository } from "./repository/system-settings.repository";
import { SystemSettingsController } from "./controller/system-settings.controller";

//System settings module
@Module({
    imports: [
        MongooseModule.forFeature([{ name: SystemSettingEntity.name, schema: SystemSettingSchema }]),
        RolesModule, ActivityModule,
    ],
    controllers: [SystemSettingsController],
    providers: [SystemSettingsRepository, SystemSettingsService],
    exports: [SystemSettingsService],
})
export class SystemSettingsModule { }