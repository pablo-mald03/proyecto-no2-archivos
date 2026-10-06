import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { FieldLimits } from "src/common/constants/field-limits";

// Activity metadata entity
@Schema({ _id: false })
export class ActivityMetadataEntity {
    @Prop({ trim: true, maxlength: FieldLimits.RESOURCE_NAME.max, default: undefined })
    previousName?: string;

    @Prop({ type: Types.ObjectId, default: undefined }) fromFolderId?: Types.ObjectId | null;
    @Prop({ type: Types.ObjectId, default: undefined }) toFolderId?: Types.ObjectId | null;

    @Prop({ maxlength: FieldLimits.ACCESS.max, default: undefined }) accessLevel?: string;
    @Prop({ maxlength: FieldLimits.ACCESS.max, default: undefined }) previousAccessLevel?: string;
    @Prop({ maxlength: FieldLimits.ACCESS.max, default: undefined }) granteeType?: string;

    @Prop({ type: Number, min: 0, default: undefined }) sizeBytes?: number;
    @Prop({ type: Number, min: 0, default: undefined }) previousSizeBytes?: number;
}

//POJO definition
export const ActivityMetadataSchema = SchemaFactory.createForClass(ActivityMetadataEntity);