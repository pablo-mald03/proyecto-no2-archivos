import { ShareAccessLevel, ShareGranteeType } from "../../constants/share.constants";

/*Grant share entry request representation */
export interface GrantShareEntry {
  granteeType: ShareGranteeType;
  granteeId?: string | null;
  access: ShareAccessLevel;
}
