import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileEntity, FileSchema } from './entities/file.entity';
import { FilesRepository } from './repository/files.repository';
import { FilesService } from './service/files.service';
import { FilesController } from './controller/files.controller';
import { GridFsStorageService } from './service/grid-fs-storage.service';
import { FileValidationHelperService } from './service/file-validation-helper.service';
import { FileQuotaHelperService } from './service/file-quota-helper.service';
import { FileAccessHelperService } from './service/file-access-helper.service';
import { UsersModule } from 'src/users/users.module';
import { SharingModule } from 'src/sharing/sharing.module';
import { ActivityModule } from 'src/activity/activity.module';
import { FoldersModule } from 'src/folders/folders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema }]),
    UsersModule,
    forwardRef(() => FoldersModule),
    SharingModule,
    ActivityModule,
  ],
  controllers: [FilesController],
  providers: [
    FilesRepository,
    FilesService,
    GridFsStorageService,
    FileValidationHelperService,
    FileQuotaHelperService,
    FileAccessHelperService,
  ],
  exports: [FilesRepository, FilesService, GridFsStorageService],
})
export class FilesModule { }
