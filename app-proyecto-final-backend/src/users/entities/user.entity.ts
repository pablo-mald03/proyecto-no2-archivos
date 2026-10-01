import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

//Principal model for users (TODO)
@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true, select: false })
    passwordHash!: string;

    @Prop({ required: true, enum: ['ADMIN', 'USER'], default: 'USER' })
    role!: 'ADMIN' | 'USER';

    @Prop({ default: true })
    isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);