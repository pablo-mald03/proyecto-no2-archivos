import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { FolderEntity } from 'src/folders/entities/folder.entity';
import { FieldLimits } from 'src/common/constants/validation/field-limits';

@Schema({ collection: 'files', timestamps: true })
export class FileEntity extends AuditableEntity {
  @Prop({ type: Types.ObjectId, ref: UserEntity.name, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: FolderEntity.name, default: null, index: true })
  folderId!: Types.ObjectId | null;

  @Prop({
    required: true,
    trim: true,
    minlength: FieldLimits.RESOURCE_NAME.min,
    maxlength: FieldLimits.RESOURCE_NAME.max,
  })
  name!: string;

  @Prop({ required: true, enum: ['txt', 'md'], index: true })
  extension!: 'txt' | 'md';

  @Prop({ required: true, enum: ['text/plain', 'text/markdown'] })
  mimeType!: string;

  @Prop({ required: true, min: 0 })
  sizeBytes!: number;

  @Prop({ type: Types.ObjectId, required: true })
  gridFsId!: Types.ObjectId;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name, default: null })
  deletedBy!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  trashBatchId!: Types.ObjectId | null;

  @Prop({ default: false, index: true })
  isTrashRoot!: boolean;
}

export type FileDocument = HydratedDocument<FileEntity>;
export const FileSchema = SchemaFactory.createForClass(FileEntity);
