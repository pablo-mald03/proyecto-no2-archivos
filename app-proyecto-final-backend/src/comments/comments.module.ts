import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentEntity, CommentSchema } from './entities/comment.entity';
import { CommentsRepository } from './repository/comments.repository';
import { CommentsService } from './service/comments.service';
import { CommentsController } from './controller/comments.controller';
import { FilesModule } from 'src/files/files.module';
import { FoldersModule } from 'src/folders/folders.module';
import { UsersModule } from 'src/users/users.module';
import { SharingModule } from 'src/sharing/sharing.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CommentEntity.name, schema: CommentSchema }]),
    FilesModule,
    FoldersModule,
    UsersModule,
    SharingModule,
    ActivityModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsService],
  exports: [CommentsRepository, CommentsService],
})
export class CommentsModule { }
