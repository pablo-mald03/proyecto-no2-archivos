import { ReceivedByUserItemResponse } from "../../../../features/report-shares/models/response/received-by-user-item-response.model";
import { SharedByUserItemResponse } from "../../../../features/report-shares/models/response/shared-by-user-item-response.model";
import { ShareFlowEntry } from "../types/share-flow-entry.model";
import { getGranteeTypeLabel } from "./grantee-type-label.util";


//Maps a resource shared by the user (the counterpart is the grantee)
export function toShareFlowEntryFromShared(item: SharedByUserItemResponse): ShareFlowEntry {
  return {
    id: item.shareId,
    resourceId: item.resourceId,
    resourceName: item.resourceName,
    resourceType: item.resourceType,
    accessLevel: item.accessLevel,
    counterpartName: item.granteeUsername || getGranteeTypeLabel(item.granteeType),
    counterpartEmail: item.granteeEmail,
    viaLabel: getGranteeTypeLabel(item.granteeType),
    date: item.sharedAt
  };
}

//Maps a resource received by the user 
export function toShareFlowEntryFromReceived(item: ReceivedByUserItemResponse): ShareFlowEntry {
  return {
    id: item.shareId,
    resourceId: item.resourceId,
    resourceName: item.resourceName,
    resourceType: item.resourceType,
    accessLevel: item.accessLevel,
    counterpartName: item.ownerUsername,
    counterpartEmail: item.ownerEmail,
    viaLabel: getGranteeTypeLabel(item.granteeType),
    date: item.receivedAt
  };
}
