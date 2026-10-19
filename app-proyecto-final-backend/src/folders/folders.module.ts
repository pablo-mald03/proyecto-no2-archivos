import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderEntity, FolderSchema } from './entities/folder.entity';
import { FoldersRepository } from './repository/folders.repository';
import { FoldersService } from './service/folders.service';
import { FoldersController } from './controller/folders.controller';
import { FolderHierarchyHelperService } from './service/folder-hierarchy-helper.service';
import { ActivityModule } from 'src/activity/activity.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FolderEntity.name, schema: FolderSchema }]),
    ActivityModule,
    forwardRef(() => FilesModule),
  ],
  controllers: [FoldersController],
  providers: [FoldersRepository, FoldersService, FolderHierarchyHelperService],
  exports: [FoldersRepository, FoldersService],
})
export class FoldersModule {}
