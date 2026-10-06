import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ActivityLogData, ActivityLogDocument, ActivityLogEntity } from "../entities/activity-log.entity";
import { ClientSession, Model } from "mongoose";

@Injectable()
export class ActivityLogsRepository {
    constructor(@InjectModel(ActivityLogEntity.name) private readonly model: Model<ActivityLogDocument>) { }

    //Method to insert the log action
    async insertMany(data: ActivityLogData[], session?: ClientSession): Promise<void> {
        if (!data.length) return;
        await this.model.insertMany(data, { session });
    }
}