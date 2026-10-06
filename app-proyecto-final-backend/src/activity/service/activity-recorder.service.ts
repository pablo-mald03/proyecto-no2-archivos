import { Injectable, Logger } from "@nestjs/common";
import { ActivityLogsRepository } from "../repository/activity-logs.repository";
import { ActivityInput } from "../types/activity-input";
import { ClientSession, Types } from "mongoose";
import { ActivityLogData } from "../entities/activity-log.entity";

@Injectable()
export class ActivityRecorderService {
    private readonly logger = new Logger(ActivityRecorderService.name);
    constructor(private readonly logs: ActivityLogsRepository) { }

    //Method to record a new log
    record(input: ActivityInput | ActivityInput[]): void {
        this.recordAndWait(input).catch((e: unknown) =>
            this.logger.error('Failed to record activity', e instanceof Error ? e.stack : String(e)));
    }

    //Method to record the log waiting the response
    async recordAndWait(input: ActivityInput | ActivityInput[], session?: ClientSession): Promise<void> {
        const inputs = Array.isArray(input) ? input : [input];
        await this.logs.insertMany(inputs.map((i) => this.toData(i)), session);
    }

    //Mapper for the data
    private toData(i: ActivityInput): ActivityLogData {
        return {
            actorId: new Types.ObjectId(i.actor.id),
            actorEmail: i.actor.email,
            actorUsername: i.actor.username,
            action: i.action,
            description: i.description,
            resourceType: i.resource.type,
            resourceId: new Types.ObjectId(i.resource.id),
            resourceName: i.resource.name,
            targetUserId: i.target ? new Types.ObjectId(i.target.id) : undefined,
            targetUserEmail: i.target?.email,
            metadata: i.metadata,
        };
    }
}