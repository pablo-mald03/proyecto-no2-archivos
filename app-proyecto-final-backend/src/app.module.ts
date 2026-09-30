import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { SharingModule } from './sharing/sharing.module';
import { TrashModule } from './trash/trash.module';
import { ActivityModule } from './activity/activity.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default('1h'),
        CORS_ORIGIN: Joi.string().required(),
        DEFAULT_QUOTA_BYTES: Joi.number().default(1073741824),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({ uri: cfg.get<string>('MONGODB_URI') }),
    }),
    AuthModule, UsersModule, FoldersModule, FilesModule, SharingModule, TrashModule, 
    ActivityModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
