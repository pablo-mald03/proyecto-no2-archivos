import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


//Principal entity model for the storage table
@Schema({ _id: false })
export class StorageEntity {
    @Prop({ required: true, min: 0 }) quotaBytes!: number;
    @Prop({ required: true, min: 0, default: 0 }) usedBytes!: number;
}

//Entity mapping for persistence layer
export const StorageSchema = SchemaFactory.createForClass(StorageEntity);