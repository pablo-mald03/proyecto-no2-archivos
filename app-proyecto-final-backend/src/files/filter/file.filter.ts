import { Types } from "mongoose";

/*Principal file filter interface*/
export interface FileFilter {
    ownerId?: string | Types.ObjectId;
    folderId?: string | Types.ObjectId | null;
    extension?: 'txt' | 'md';
    isDeleted?: boolean;
    search?: string;
    from?: Date;
    to?: Date;
    minSize?: number;
    maxSize?: number;
}