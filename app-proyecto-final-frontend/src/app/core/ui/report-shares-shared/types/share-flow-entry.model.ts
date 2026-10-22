import { ResourceType } from "../../../../features/report-shared/models/resource-type.model";

/* View model of one share used by the timeline and the owner groups models*/
export interface ShareFlowEntry {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  accessLevel: string;
  counterpartName: string;
  counterpartEmail?: string;
  viaLabel: string;
  date: string;
}
