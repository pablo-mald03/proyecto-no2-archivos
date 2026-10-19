import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DEV_PASSWORD, DEV_USERS } from './data/dev-users.data';
import { UsersSeeder } from './users.seeder';
import { DriveDemoSeeder } from './drive-demo.seeder';
import { UsersRepository } from 'src/users/repository/users.repository';
import { RolesRepository } from 'src/roles/repository/roles.repository';
import { PasswordService } from 'src/password/service/password.service';
import { SettingKey } from 'src/common/constants/validation/setting-key';
import { SystemSettingsService } from 'src/system-settings/service/system-settings.service';
import { FoldersRepository } from 'src/folders/repository/folders.repository';
import { FilesRepository } from 'src/files/repository/files.repository';
import { GridFsStorageService } from 'src/files/service/grid-fs-storage.service';
import { SharesRepository } from 'src/sharing/repository/shares.repository';
import { CommentsRepository } from 'src/comments/repository/comments.repository';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';

/*Principal function to run all seeders*/
async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cfg = app.get(ConfigService);
  const settings = app.get(SystemSettingsService, { strict: false });

  try {
    if (cfg.get<string>('NODE_ENV') === 'production') {
      throw new Error('Development seeds must not run in production');
    }

    const usersSeeder = new UsersSeeder(
      app.get(UsersRepository, { strict: false }),
      app.get(RolesRepository, { strict: false }),
      app.get(PasswordService, { strict: false }),
      await settings.getNumber(SettingKey.STORAGE_DEFAULT_QUOTA_BYTES),
    );
    await usersSeeder.run(DEV_USERS, DEV_PASSWORD);

    const driveSeeder = new DriveDemoSeeder(
      app.get(UsersRepository, { strict: false }),
      app.get(FoldersRepository, { strict: false }),
      app.get(FilesRepository, { strict: false }),
      app.get(GridFsStorageService, { strict: false }),
      app.get(SharesRepository, { strict: false }),
      app.get(CommentsRepository, { strict: false }),
      app.get(ActivityRecorderService, { strict: false }),
    );
    await driveSeeder.run();
  } finally {
    await app.close();
  }
}

run().catch((err: unknown) => {
  Logger.error(err instanceof Error ? err.message : String(err), 'Seed');
  process.exit(1);
});