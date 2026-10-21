import { Types } from "mongoose";

/*Principal resource target interface*/
export interface ResourceTarget {
    type: 'FILE' | 'FOLDER';
    id: Types.ObjectId | string;
    ownerId: Types.ObjectId | string;
    ancestors?: (Types.ObjectId | string)[];
}