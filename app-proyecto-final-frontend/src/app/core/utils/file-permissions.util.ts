import { FLAGS_BY_ROLE, PermissionRole, ShareAccessLevel } from "../../features/shares/constants/share.constants";
import { PermissionFlags } from "../../features/shares/models/permissions-flags.model";
import { ResourcePermissions } from "../../features/shares/models/resource-permissions.model";

/*Principal function flag resolver settings */
export function resolveFlags(role: PermissionRole | null | undefined): PermissionFlags {
  return FLAGS_BY_ROLE[role ?? 'VIEWER'] ?? FLAGS_BY_ROLE.VIEWER;
}
 
/** Principal shared access level function */
export function toShareAccessLevel(role: PermissionRole): ShareAccessLevel {
  return role === 'OWNER' ? 'EDITOR' : role;
}
 
/** Principal function to evaluate if the file or folder has ancestors */
export function isInherited(p: ResourcePermissions | null | undefined, resourceId: string): boolean {
  return !!p?.inheritedFromFolderId && p.inheritedFromFolderId !== resourceId;
}
