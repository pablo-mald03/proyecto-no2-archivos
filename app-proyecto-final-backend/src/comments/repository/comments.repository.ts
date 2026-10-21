import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { CommentDocument, CommentEntity } from '../entities/comment.entity';

/*Principal comments repository class*/
@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(CommentEntity.name) private readonly model: Model<CommentEntity>,
  ) { }

  //Method to find a comment by ID
  findById(id: string | Types.ObjectId, session?: ClientSession): Promise<CommentDocument | null> {
    return this.model.findById(id).session(session || null).exec();
  }

  //Method to find all comments of a file chronologically
  findByFile(fileId: string | Types.ObjectId, session?: ClientSession): Promise<CommentDocument[]> {
    return this.model
      .find({ fileId: new Types.ObjectId(fileId) })
      .sort({ createdAt: 1 })
      .session(session || null)
      .exec();
  }

  //Method to create a comment
  create(data: { fileId: Types.ObjectId; authorId: Types.ObjectId; parentId: Types.ObjectId | null; content: string; }, session?: ClientSession): Promise<CommentDocument> {
    const doc = new this.model(data);
    return doc.save({ session });
  }

  //Method to edit a comment content
  updateContent(id: string | Types.ObjectId, content: string, session?: ClientSession,): Promise<CommentDocument | null> {

    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { content, editedAt: new Date() } },
        { new: true, session },
      )
      .exec();
  }

  //Method to soft-delete a comment (displays as deleted keeping thread intact)
  softDelete(id: string | Types.ObjectId, session?: ClientSession): Promise<CommentDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { isDeleted: true, content: 'Este comentario ha sido eliminado' } },
        { new: true, session },
      )
      .exec();
  }

  //Method to count replies for a comment
  countReplies(parentId: Types.ObjectId, session?: ClientSession): Promise<number> {
    return this.model.countDocuments({ parentId }).session(session || null).exec();
  }

  //Method to hard-delete comment if it has no replies
  deleteById(id: string | Types.ObjectId, session?: ClientSession): Promise<boolean> {
    return this.model
      .deleteOne({ _id: new Types.ObjectId(id) })
      .session(session || null)
      .then((res) => res.deletedCount > 0);
  }

  //Method to delete all comments belonging to a file
  deleteByFile(fileId: string | Types.ObjectId, session?: ClientSession): Promise<number> {
    return this.model
      .deleteMany({ fileId: new Types.ObjectId(fileId) })
      .session(session || null)
      .then((res) => res.deletedCount);
  }
}
