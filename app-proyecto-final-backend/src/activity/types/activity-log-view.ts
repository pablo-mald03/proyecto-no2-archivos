import { Types } from "mongoose";
import { ActivityLogEntity } from "../entities/activity-log.entity";

/*Principal activity log view model*/
export type ActivityLogView = ActivityLogEntity & { _id: Types.ObjectId };