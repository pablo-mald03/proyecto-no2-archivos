import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

//Principal entity model for the roles table
@Schema({ collection: 'roles', timestamps: true })
export class RoleEntity {
    @Prop({ required: true, unique: true, trim: true, uppercase: true })
    code!: string;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ trim: true, default: '' })
    description!: string;

    // List of permissions
    @Prop({ type: [String], default: [] })
    permissions!: string[];

    //Principal flag protection for the role
    @Prop({ default: false })
    isSystem!: boolean;
}

//Model POJO representation
export type RoleDocument = HydratedDocument<RoleEntity>;

//Entity mapping for persistence layer
export const RoleSchema = SchemaFactory.createForClass(RoleEntity);