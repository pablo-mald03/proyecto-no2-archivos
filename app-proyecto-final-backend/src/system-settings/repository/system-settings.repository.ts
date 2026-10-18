import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { SystemSettingDocument, SystemSettingEntity } from "../entities/system-setting.entity";
import { Model, Types } from "mongoose";

/*Principal system settings repository */
@Injectable()
export class SystemSettingsRepository {
  constructor(@InjectModel(SystemSettingEntity.name) private readonly model: Model<SystemSettingEntity>) { }

  //Method to find all settings
  findAll(): Promise<SystemSettingDocument[]> {
    return this.model.find().sort({ key: 1 }).exec();
  }

  //Method to find by key
  findByKey(key: string): Promise<SystemSettingDocument | null> {
    return this.model.findOne({ key }).exec();
  }

  //Method to update the value for the setting
  updateValue(key: string,value: string | number,updatedBy: string,): Promise<SystemSettingDocument | null> {
    return this.model.findOneAndUpdate(
      { key },
      {
        $set: {
          value,
          updatedBy: new Types.ObjectId(updatedBy),
        },
      },
      { returnDocument: 'after' },
    ).exec();
  }
}