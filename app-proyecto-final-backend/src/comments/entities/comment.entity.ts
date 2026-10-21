import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileEntity } from 'src/files/entities/file.entity';
import { UserEntity } from 'src/users/entities/user.entity';

/*Principal comment entity model*/
@Schema({ collection: 'comments', timestamps: { createdAt: true, updatedAt: false } })
export class CommentEntity {
  @Prop({ type: Types.ObjectId, ref: FileEntity.name, required: true, index: true })
  fileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name, required: true, index: true })
  authorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: CommentEntity.name, default: null, index: true })
  parentId!: Types.ObjectId | null;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 2000 })
  content!: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  editedAt!: Date | null;

  @Prop({ type: Date, default: () => new Date() })
  createdAt!: Date;
}

/*Model POJO representation*/
export type CommentDocument = HydratedDocument<CommentEntity>;
/*Entity mapping for persistence layer*/
export const CommentSchema = SchemaFactory.createForClass(CommentEntity);
