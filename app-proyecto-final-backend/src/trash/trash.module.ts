import { Module } from '@nestjs/common';
import { TrashService } from './service/trash.service';
import { TrashController } from './controller/trash.controller';
import { FoldersModule } from 'src/folders/folders.module';
import { FilesModule } from 'src/files/files.module';
import { UsersModule } from 'src/users/users.module';
import { SharingModule } from 'src/sharing/sharing.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    FoldersModule,
    FilesModule,
    UsersModule,
    SharingModule,
    ActivityModule,
  ],
  controllers: [TrashController],
  providers: [TrashService],
  exports: [TrashService],
})
export class TrashModule { }