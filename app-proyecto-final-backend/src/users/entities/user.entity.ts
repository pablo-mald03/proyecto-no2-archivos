import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { StorageEntity, StorageSchema } from './storage.entity';
import { FieldLimits } from 'src/common/constants/field-limits';
import { AuditableEntity } from 'src/common/entities/auditable.entity';


//Principal entity model for the users table
@Schema({ collection: 'users', timestamps: true })
export class UserEntity extends AuditableEntity {
    @Prop({
        required: true, unique: true, lowercase: true, trim: true,
        minlength: FieldLimits.USERNAME.min, maxlength: FieldLimits.USERNAME.max,
    })
    username!: string;

    @Prop({
        required: true, unique: true, lowercase: true, trim: true,
        maxlength: FieldLimits.EMAIL.max,
    })
    email!: string;

    @Prop({ required: true, select: false })
    passwordHash!: string;

    @Prop({
        required: true, trim: true,
        minlength: FieldLimits.PERSON_NAME.min, maxlength: FieldLimits.PERSON_NAME.max,
    })
    firstName!: string;

    @Prop({
        required: true, trim: true,
        minlength: FieldLimits.PERSON_NAME.min, maxlength: FieldLimits.PERSON_NAME.max,
    })
    lastName!: string;

    @Prop({ type: Types.ObjectId, ref: RoleEntity.name, required: true, index: true })
    roleId!: Types.ObjectId;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ type: Date, default: null })
    deactivatedAt!: Date | null;

    @Prop({ type: Date, default: null })
    lastLoginAt!: Date | null;

    @Prop({ type: StorageSchema, required: true })
    storage!: StorageEntity;
}


//Model POJO representation
export type UserDocument = HydratedDocument<UserEntity>;

//Entity mapping for persistence layer
export const UserSchema = SchemaFactory.createForClass(UserEntity);