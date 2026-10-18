import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileEntity, FileSchema } from './entities/file.entity';
import { FilesRepository } from './repository/files.repository';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema }]),
  ],
  controllers: [FilesController],
  providers: [FilesRepository, FilesService],
  exports: [FilesRepository],
})
export class FilesModule {}
