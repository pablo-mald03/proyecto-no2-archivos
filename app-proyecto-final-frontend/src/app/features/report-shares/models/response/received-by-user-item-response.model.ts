import { ResourceType } from "../../../report-shared/models/resource-type.model";

/* Resource received by a user response model */
export interface ReceivedByUserItemResponse {
  shareId: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  accessLevel: string;
  granteeType: string;
  ownerUsername: string;
  ownerEmail: string;
  receivedAt: string;
}
