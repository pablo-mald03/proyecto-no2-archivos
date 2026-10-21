import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportUsersService } from './service/report-users.service';
import { ReportUsersController } from './controller/report-users.controller';
import { ReportUsersRepository } from './repository/report-users.repository';
import { UserEntity, UserSchema } from 'src/users/entities/user.entity';
import { FileEntity, FileSchema } from 'src/files/entities/file.entity';
import { ShareEntity, ShareSchema } from 'src/sharing/entities/share.entity';

/* Principal module for user-based reports */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: FileEntity.name, schema: FileSchema },
      { name: ShareEntity.name, schema: ShareSchema },
    ]),
  ],
  controllers: [ReportUsersController],
  providers: [ReportUsersService, ReportUsersRepository],
})
export class ReportUsersModule { }
