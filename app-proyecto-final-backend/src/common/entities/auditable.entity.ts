import { Prop, Schema } from '@nestjs/mongoose';

// Base auditable class: never registered as a collection, only inherited
@Schema()
export abstract class AuditableEntity {
    @Prop({ type: Date })
    createdAt!: Date;

    @Prop({ type: Date })
    updatedAt!: Date;
}