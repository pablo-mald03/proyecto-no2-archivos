import { Types } from 'mongoose';

/*Principal folder filter model*/
export interface FolderFilter {
  ownerId?: string | Types.ObjectId;
  parentId?: string | Types.ObjectId | null;
  search?: string;
  isDeleted?: boolean;
}
