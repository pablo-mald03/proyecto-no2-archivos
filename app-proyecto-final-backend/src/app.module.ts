import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from './config/env.validation';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { SharingModule } from './sharing/sharing.module';
import { TrashModule } from './trash/trash.module';
import { ActivityModule } from './activity/activity.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RefreshTokensModule } from './refresh-tokens/refresh-token.module';
import { CommentsModule } from './comments/comments.module';
import { ReportUsersModule } from './report-users/report-users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.getOrThrow<string>('MONGODB_URI'),
        autoIndex: false, // indexes are owned by the migrations
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 200,
      },
    ]),
    AuthModule,
    UsersModule,
    FoldersModule,
    FilesModule,
    SharingModule,
    TrashModule,
    ActivityModule,
    RolesModule,
    PermissionsModule,
    RefreshTokensModule,
    CommentsModule,
    ReportUsersModule,
  ],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule { }
