import { ShareResourceType, ShareGranteeType, ShareAccessLevel } from "../../constants/share.constants";

/*Share response model representation */
export interface ShareResponse {
  id: string;
  resourceType: ShareResourceType;
  resourceId: string;
  ownerId: string;
  granteeType: ShareGranteeType;
  granteeId: string | null;
  granteeEmail?: string | null;
  granteeUsername?: string | null;
  access: ShareAccessLevel;
  createdAt: string;
  updatedAt: string;
}
