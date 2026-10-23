import { PermissionFlags } from "../models/permissions-flags.model";

/*Share resource type for api route parameter */
export type ShareTargetType = 'folders' | 'files';

/*Share resource enum types */
export type ShareResourceType = 'FILE' | 'FOLDER';

/*Share grantee enum types */
export type ShareGranteeType = 'USER' | 'ANY_USER';

/*Share access level types */
export type ShareAccessLevel = 'VIEWER' | 'COMMENTER' | 'EDITOR';

export type PermissionRole = 'OWNER' | ShareAccessLevel;

export const SHARE_ACCESS_LEVELS = {
  VIEWER: 'VIEWER',
  COMMENTER: 'COMMENTER',
  EDITOR: 'EDITOR'
} as const;

export const SHARE_GRANTEE_TYPES = {
  USER: 'USER',
  ANY_USER: 'ANY_USER'
} as const;


export const FLAGS_BY_ROLE: Record<PermissionRole, PermissionFlags> = {
  OWNER:     { canView: true, canComment: true,  canEdit: true,  canShare: true,  canDelete: true,  canDownload: true },
  EDITOR:    { canView: true, canComment: true,  canEdit: true,  canShare: true,  canDelete: false, canDownload: true },
  COMMENTER: { canView: true, canComment: true,  canEdit: false, canShare: false, canDelete: false, canDownload: true },
  VIEWER:    { canView: true, canComment: false, canEdit: false, canShare: false, canDelete: false, canDownload: true },
};

