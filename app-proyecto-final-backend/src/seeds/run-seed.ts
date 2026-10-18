import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DEV_PASSWORD, DEV_USERS } from './data/dev-users.data';
import { UsersSeeder } from './users.seeder';
import { UsersRepository } from 'src/users/repository/users.repository';
import { RolesRepository } from 'src/roles/repository/roles.repository';
import { PasswordService } from 'src/password/service/password.service';
import { SettingKey } from 'src/common/constants/validation/setting-key';
import { SystemSettingsService } from 'src/system-settings/service/system-settings.service';

//Principal function to run all seeders
async function run(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule);
    const cfg = app.get(ConfigService);

    const settings = app.get(SystemSettingsService, { strict: false });


    try {
        if (cfg.get<string>('NODE_ENV') === 'production') {
            throw new Error('Development seeds must not run in production');
        }

        const seeder = new UsersSeeder(
            app.get(UsersRepository, { strict: false }),
            app.get(RolesRepository, { strict: false }),
            app.get(PasswordService, { strict: false }),
            await settings.getNumber(SettingKey.STORAGE_DEFAULT_QUOTA_BYTES),
        );
        await seeder.run(DEV_USERS, DEV_PASSWORD);
    } finally {
        await app.close();
    }
}

run().catch((err: unknown) => {
    Logger.error(err instanceof Error ? err.message : String(err), 'Seed');
    process.exit(1);
});