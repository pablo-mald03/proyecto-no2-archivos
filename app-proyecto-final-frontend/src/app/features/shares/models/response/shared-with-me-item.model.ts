import { ShareResponse } from "./share-response.model";
import { SharedResource } from "../share-resource.model";

/*Shared with me item representation model */
export interface SharedWithMeItem {
  share: ShareResponse;
  resource: SharedResource;
}
