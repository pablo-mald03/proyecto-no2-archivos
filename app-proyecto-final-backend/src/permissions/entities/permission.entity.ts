import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

//Principal entity model for permissions table
@Schema({ collection: 'permissions' })
export class PermissionEntity {
    @Prop({ required: true, unique: true, trim: true, uppercase: true })
    code!: string;

    @Prop({ required: true, trim: true })
    module!: string;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true, trim: true })
    description!: string;
}

//Model POJO representation
export type PermissionDocument = HydratedDocument<PermissionEntity>;

//Entity mapping for persistence layer
export const PermissionSchema = SchemaFactory.createForClass(PermissionEntity);