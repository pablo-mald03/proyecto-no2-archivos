import { ShareFlowEntry } from "./share-flow-entry.model";

/* View model of the received shares grouped by owner model */
export interface ShareOwnerGroup {
  key: string;
  name: string;
  email?: string;
  entries: ShareFlowEntry[];
}
