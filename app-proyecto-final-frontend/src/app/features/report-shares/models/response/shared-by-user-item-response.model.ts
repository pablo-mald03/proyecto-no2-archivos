import { ResourceType } from "../../../report-shared/models/resource-type.model";

/* Resource shared by a user response model */
export interface SharedByUserItemResponse {
  shareId: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  accessLevel: string;
  granteeType: string;
  granteeUsername?: string;
  granteeEmail?: string;
  sharedAt: string;
}
