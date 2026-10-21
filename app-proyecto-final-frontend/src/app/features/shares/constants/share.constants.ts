/*Share resource type for api route parameter */
export type ShareTargetType = 'folders' | 'files';

/*Share resource enum types */
export type ShareResourceType = 'FILE' | 'FOLDER';

/*Share grantee enum types */
export type ShareGranteeType = 'USER' | 'ANY_USER';

/*Share access level types */
export type ShareAccessLevel = 'VIEWER' | 'COMMENTER' | 'EDITOR';

export const SHARE_ACCESS_LEVELS = {
  VIEWER: 'VIEWER',
  COMMENTER: 'COMMENTER',
  EDITOR: 'EDITOR'
} as const;

export const SHARE_GRANTEE_TYPES = {
  USER: 'USER',
  ANY_USER: 'ANY_USER'
} as const;
