import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ResourceType } from 'src/common/constants/actions/resource-type';
import { AccessLevel, GranteeType } from 'src/common/constants/permissions/access-level';

@Schema({ collection: 'shares', timestamps: true })
export class ShareEntity extends AuditableEntity {
  @Prop({ required: true, enum: [ResourceType.FILE, ResourceType.FOLDER], index: true })
  resourceType!: 'FILE' | 'FOLDER';

  @Prop({ type: Types.ObjectId, required: true, index: true })
  resourceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(GranteeType) })
  granteeType!: GranteeType;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name, default: null, index: true })
  granteeId!: Types.ObjectId | null;

  @Prop({ required: true, enum: Object.values(AccessLevel) })
  access!: AccessLevel;
}

export type ShareDocument = HydratedDocument<ShareEntity>;
export const ShareSchema = SchemaFactory.createForClass(ShareEntity);
