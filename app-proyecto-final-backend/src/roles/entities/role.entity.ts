import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FieldLimits } from 'src/common/constants/field-limits';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

//Principal entity model for the roles table
@Schema({ collection: 'roles', timestamps: true })
export class RoleEntity extends AuditableEntity {
    @Prop({
        required: true, unique: true, trim: true, uppercase: true,
        minlength: FieldLimits.ROLE_CODE.min, maxlength: FieldLimits.ROLE_CODE.max,
    })
    code!: string;

    @Prop({
        required: true, trim: true,
        minlength: FieldLimits.ROLE_NAME.min, maxlength: FieldLimits.ROLE_NAME.max,
    })
    name!: string;

    @Prop({ trim: true, default: '', maxlength: FieldLimits.DESCRIPTION.max, })
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