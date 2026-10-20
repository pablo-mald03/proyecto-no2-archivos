import { FolderResponse } from "../../folders/models/response/folder-response.model";
import { FileResponse } from "../../files/models/response/file-response.model";
import { TrashItem } from "../../trash/models/trash-item.model";
import { SharedWithMeItem } from "../../shares/models/response/shared-with-me-item.model";
import { ShareAccessLevel } from "../../shares/constants/share.constants";

/*Principal drive item type */
export type DriveItemType = 'folder' | 'file';

/*Principal drive item */
export interface DriveItem {
  id: string;
  name: string;
  type: DriveItemType;
  extension?: 'txt' | 'md' | string;
  sizeBytes?: number;
  updatedAt: string | Date;
  shared?: boolean;
  trashBatchId?: string;
  deletedAt?: string;
  access?: ShareAccessLevel;
  ownerId?: string;
}

//Helper to map folder response to drive item representation
export function mapFolderToDriveItem(folder: FolderResponse): DriveItem {
  return {
    id: folder.id,
    name: folder.name,
    type: 'folder',
    updatedAt: folder.updatedAt
  };
}

//Helper to map file response to drive item representation
export function mapFileToDriveItem(file: FileResponse): DriveItem {
  return {
    id: file.id,
    name: file.name,
    type: 'file',
    extension: file.extension,
    sizeBytes: file.sizeBytes,
    updatedAt: file.updatedAt
  };
}

//Helper to map trash item response to drive item representation
export function mapTrashItemToDriveItem(trash: TrashItem): DriveItem {
  return {
    id: trash.id,
    name: trash.name,
    type: trash.type === 'FOLDER' ? 'folder' : 'file',
    extension: trash.extension,
    sizeBytes: trash.sizeBytes,
    updatedAt: trash.deletedAt,
    deletedAt: trash.deletedAt,
    trashBatchId: trash.trashBatchId
  };
}

//Helper to map shared with me response to drive item representation
export function mapSharedWithMeToDriveItem(item: SharedWithMeItem): DriveItem {
  return {
    id: item.resource.id,
    name: item.resource.name,
    type: item.resource.type === 'FOLDER' ? 'folder' : 'file',
    extension: item.resource.extension,
    sizeBytes: item.resource.sizeBytes,
    updatedAt: item.resource.updatedAt,
    shared: true,
    access: item.share.access,
    ownerId: item.resource.ownerId
  };
}

