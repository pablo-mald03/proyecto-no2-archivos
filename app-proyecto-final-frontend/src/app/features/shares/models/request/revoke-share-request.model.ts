import { ShareGranteeType } from "../../constants/share.constants";

/*Revoke share request model */
export interface RevokeShareRequest {
  granteeType: ShareGranteeType;
  granteeId?: string | null;
}
