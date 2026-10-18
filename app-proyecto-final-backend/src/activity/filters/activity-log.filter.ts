import { ActivityAction } from "src/common/constants/actions/activity-action";
import { ResourceType } from "src/common/constants/actions/resource-type";

/*Principal log activity filter model */
export interface ActivityLogFilter {
  actorId?: string;
  action?: ActivityAction;
  resourceType?: ResourceType;
  resourceId?: string;
  from?: Date;
  to?: Date;
}
