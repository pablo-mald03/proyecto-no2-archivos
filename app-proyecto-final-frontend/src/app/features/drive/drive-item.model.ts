export type DriveItemType = 'folder' | 'file';

/*Principal dirve item */
export interface DriveItem {
  id: string;
  name: string;
  type: DriveItemType;
  extension?: 'txt' | 'md' | string;
  sizeBytes?: number;
  updatedAt: string | Date;
  shared?: boolean;
}