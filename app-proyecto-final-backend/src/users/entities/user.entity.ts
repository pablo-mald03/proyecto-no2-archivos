import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

//Principal model entity for users
@Schema({ collection: 'users', timestamps: true })
export class UserEntity {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true, select: false })
    passwordHash!: string;

    @Prop({ required: true, enum: ['ADMIN', 'USER'], default: 'USER' })
    role!: 'ADMIN' | 'USER';

    @Prop({ default: true })
    isActive!: boolean;
}

//User document
export type UserDocument = HydratedDocument<UserEntity>;


export const UserSchema = SchemaFactory.createForClass(UserEntity);