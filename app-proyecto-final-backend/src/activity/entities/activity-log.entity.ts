import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { FieldLimits } from "src/common/constants/validation/field-limits";
import { ActivityMetadataEntity, ActivityMetadataSchema } from "./activity-metadata.entity";
import { ActivityAction } from "src/common/constants/actions/activity-action";
import { ResourceType } from "src/common/constants/actions/resource-type";

//Activity log entity
@Schema({ collection: 'activity_logs', timestamps: { createdAt: true, updatedAt: false } })
export class ActivityLogEntity {
    @Prop({ type: Types.ObjectId, required: true }) actorId!: Types.ObjectId;
    @Prop({
        required: true, trim: true, minlength: FieldLimits.ACTOR_EMAIL.min,
        maxlength: FieldLimits.ACTOR_EMAIL.max
    }) actorEmail!: string;
    @Prop({
        required: true, trim: true, minlength: FieldLimits.ACTOR_USERNAME.min,
        maxlength: FieldLimits.ACTOR_USERNAME.max
    }) actorUsername!: string;

    @Prop({ required: true, enum: Object.values(ActivityAction) }) action!: ActivityAction;
    @Prop({ required: true, enum: Object.values(ResourceType) }) resourceType!: ResourceType;
    @Prop({ type: Types.ObjectId, required: true }) resourceId!: Types.ObjectId;
    @Prop({
        required: true, trim: true, minlength: FieldLimits.RESOURCE_NAME.min,
        maxlength: FieldLimits.RESOURCE_NAME.max
    }) resourceName!: string;

    @Prop({ required: true, trim: true, maxlength: FieldLimits.DESCRIPTION.max }) description!: string;

    @Prop({ type: Types.ObjectId, default: undefined }) targetUserId?: Types.ObjectId;
    @Prop({
        trim: true, minlength: FieldLimits.TARGET_EMAIL.min,
        maxlength: FieldLimits.TARGET_EMAIL.max, default: undefined
    }) targetUserEmail?: string;

    @Prop({ type: ActivityMetadataSchema, default: undefined }) metadata?: ActivityMetadataEntity;

    @Prop({ type: Date }) createdAt!: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLogEntity);

//Model POJO representation
export type ActivityLogDocument = HydratedDocument<ActivityLogEntity>;

//Entity mapping for persistence layer
export type ActivityLogData = Omit<ActivityLogEntity, 'createdAt'>;