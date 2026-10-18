import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderEntity, FolderSchema } from './entities/folder.entity';
import { FoldersRepository } from './repository/folders.repository';
import { FoldersService } from './service/folders.service';
import { FoldersController } from './controller/folders.controller';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FolderEntity.name, schema: FolderSchema }]),
    ActivityModule,
  ],
  controllers: [FoldersController],
  providers: [FoldersRepository, FoldersService],
  exports: [FoldersRepository, FoldersService],
})
export class FoldersModule { }
