import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

//Principal entity for the 
@Schema({ collection: "refresh_tokens", timestamps: true })
export class RefreshTokenEntity {
    @Prop({ type: Types.ObjectId, ref: 'UserEntity.name', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, unique: true })
    tokenHash!: string;

    @Prop({ type: Date, required: true })
    expiresAt!: Date;

    @Prop({ type: Date, default: null })
    revokedAt!: Date | null;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshTokenEntity);

//Auto delete the register
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });