import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FieldLimits } from 'src/common/constants/field-limits';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

//Principal entity model for permissions table
@Schema({ collection: 'permissions', timestamps: true })
export class PermissionEntity extends AuditableEntity {
    @Prop({
        required: true, unique: true, trim: true, uppercase: true,
        minlength: FieldLimits.PERMISSION_CODE.min, maxlength: FieldLimits.PERMISSION_CODE.max,
    })
    code!: string;

    @Prop({
        required: true, trim: true,
        minlength: FieldLimits.PERMISSION_MODULE.min, maxlength: FieldLimits.PERMISSION_MODULE.max,
    })
    module!: string;

    @Prop({
        required: true, trim: true,
        minlength: FieldLimits.PERMISSION_NAME.min, maxlength: FieldLimits.PERMISSION_NAME.max,
    })
    name!: string;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: FieldLimits.DESCRIPTION.max, })
    description!: string;
}

//Model POJO representation
export type PermissionDocument = HydratedDocument<PermissionEntity>;

//Entity mapping for persistence layer
export const PermissionSchema = SchemaFactory.createForClass(PermissionEntity);