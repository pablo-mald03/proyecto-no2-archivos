import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportFoldersService } from './service/report-folders.service';
import { ReportFoldersController } from './controller/report-folders.controller';
import { ReportFoldersRepository } from './repository/report-folders.repository';
import { FolderEntity, FolderSchema } from 'src/folders/entities/folder.entity';
import { FileEntity, FileSchema } from 'src/files/entities/file.entity';

/* Principal module for folder reports */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FolderEntity.name, schema: FolderSchema },
      { name: FileEntity.name, schema: FileSchema },
    ]),
  ],
  controllers: [ReportFoldersController],
  providers: [ReportFoldersService, ReportFoldersRepository],
})
export class ReportFoldersModule { }
