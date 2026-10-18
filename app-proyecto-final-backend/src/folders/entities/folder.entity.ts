import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { FieldLimits } from 'src/common/constants/validation/field-limits';

/*Principal folder entity model */
@Schema({ collection: 'folders', timestamps: true })
export class FolderEntity extends AuditableEntity {
  @Prop({ type: Types.ObjectId, ref: UserEntity.name, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: FolderEntity.name, default: null })
  parentId!: Types.ObjectId | null;

  @Prop({
    required: true,
    trim: true,
    minlength: FieldLimits.RESOURCE_NAME.min,
    maxlength: FieldLimits.RESOURCE_NAME.max,
  })
  name!: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: FolderEntity.name }],
    default: [],
    index: true,
  })
  ancestors!: Types.ObjectId[];

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

/*Model POJO representation*/
export type FolderDocument = HydratedDocument<FolderEntity>;

/*Entity mapping for persistence layer*/
export const FolderSchema = SchemaFactory.createForClass(FolderEntity);
