import { ShareResponse } from "./share-response.model";
import { ShareResourceType } from "../../constants/share.constants";

/*Shared resource representation */
export interface SharedResource {
  id: string;
  type: ShareResourceType;
  name: string;
  extension?: string;
  mimeType?: string;
  sizeBytes?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/*Shared with me item representation */
export interface SharedWithMeItem {
  share: ShareResponse;
  resource: SharedResource;
}
