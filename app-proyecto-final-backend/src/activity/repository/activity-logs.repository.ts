import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ActivityLogData, ActivityLogDocument, ActivityLogEntity } from "../entities/activity-log.entity";
import { ClientSession, Model, QueryFilter, Types } from "mongoose";
import { ActivityLogFilter } from "../filters/activity-log.filter";
import { ActivityLogView } from "../types/activity-log-view";
import { PageRequest } from "src/common/types/page-request";

@Injectable()
export class ActivityLogsRepository {
    constructor(@InjectModel(ActivityLogEntity.name) private readonly model: Model<ActivityLogDocument>) { }

    //Method to insert the log action
    async insertMany(data: ActivityLogData[], session?: ClientSession): Promise<void> {
        if (!data.length) return;
        await this.model.insertMany(data, { session });
    }

    /*Get all logs with pagination */
    async findPage(filter: ActivityLogFilter, page: PageRequest) {
        const mongoFilter = this.buildFilter(filter);
        const dir = page.direction === 'asc' ? 1 : -1;
        const [content, total] = await Promise.all([
            this.model.find(mongoFilter)
                .sort({ [page.sortBy]: dir, _id: dir }) // _id keeps pages stable
                .skip(page.page * page.size).limit(page.size)
                .lean<ActivityLogView[]>().exec(),
            this.model.countDocuments(mongoFilter).exec(),
        ]);
        return { content, total };
    }

    /*Filter builder helper method */
    private buildFilter(f: ActivityLogFilter): QueryFilter<ActivityLogEntity> {
        const q: QueryFilter<ActivityLogEntity> = {};
        if (f.actorId) q.actorId = new Types.ObjectId(f.actorId);
        if (f.resourceId) q.resourceId = new Types.ObjectId(f.resourceId);
        if (f.action) q.action = f.action;
        if (f.resourceType) q.resourceType = f.resourceType;
        if (f.from || f.to) q.createdAt = { ...(f.from && { $gte: f.from }), ...(f.to && { $lte: f.to }) };
        return q;
    }
}