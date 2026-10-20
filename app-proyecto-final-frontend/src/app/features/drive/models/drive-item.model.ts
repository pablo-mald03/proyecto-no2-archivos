import { FolderResponse } from "../../folders/models/response/folder-response.model";
import { FileResponse } from "../../files/models/response/file-response.model";
import { TrashItem } from "../../trash/models/trash-item.model";

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
