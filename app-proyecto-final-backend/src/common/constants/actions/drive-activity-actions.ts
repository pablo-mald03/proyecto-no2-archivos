import { ActivityAction } from './activity-action';
import { ResourceType } from './resource-type';

/**
 * Drive/user activity actions
 */
export const DRIVE_ACTIVITY_ACTIONS: ActivityAction[] = [
  ActivityAction.FILE_UPLOADED,
  ActivityAction.FILE_DOWNLOADED,
  ActivityAction.FILE_RENAMED,
  ActivityAction.FILE_MOVED,
  ActivityAction.FILE_EDITED,
  ActivityAction.FILE_TRASHED,
  ActivityAction.FILE_RESTORED,
  ActivityAction.FILE_DELETED_PERMANENTLY,
  ActivityAction.FOLDER_CREATED,
  ActivityAction.FOLDER_RENAMED,
  ActivityAction.FOLDER_MOVED,
  ActivityAction.FOLDER_TRASHED,
  ActivityAction.FOLDER_RESTORED,
  ActivityAction.FOLDER_DELETED_PERMANENTLY,
  ActivityAction.ACCESS_GRANTED,
  ActivityAction.ACCESS_CHANGED,
  ActivityAction.ACCESS_REVOKED,
  ActivityAction.COMMENT_ADDED,
];

/**
 * Drive resource types visible to normal drive users model
 */
export const DRIVE_RESOURCE_TYPES: ResourceType[] = [
  ResourceType.FILE,
  ResourceType.FOLDER,
];
