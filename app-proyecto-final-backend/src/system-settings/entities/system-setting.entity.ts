import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { FieldLimits } from "src/common/constants/field-limits";
import { AuditableEntity } from "src/common/entities/auditable.entity";
import { Schema as MongooseSchema } from 'mongoose'

//Principal entity model for the system settings table
@Schema({ collection: 'system_settings', timestamps: true })
export class SystemSettingEntity extends AuditableEntity {
    @Prop({ required: true, trim: true, minlength: FieldLimits.SETTING_KEY.min, maxlength: FieldLimits.SETTING_KEY.max })
    key!: string;

    // Validated by the service according to the key (number for quotas, string for codes)
    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    value!: string | number;

    @Prop({ required: true, trim: true, maxlength: FieldLimits.DESCRIPTION.max })
    description!: string;

    @Prop({ type: Types.ObjectId, default: undefined })
    updatedBy?: Types.ObjectId;
}

//Model POJO representation
export const SystemSettingSchema = SchemaFactory.createForClass(SystemSettingEntity);

//Entity mapping for persistence layer
export type SystemSettingDocument = HydratedDocument<SystemSettingEntity>;