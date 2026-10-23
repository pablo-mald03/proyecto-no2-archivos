import { PermissionRole } from "../constants/share.constants";

/*Principal resource permissions model */
export interface ResourcePermissions {
  role: PermissionRole;
  inheritedFromFolderId?: string | null;
  parentName?: string | null;
}
