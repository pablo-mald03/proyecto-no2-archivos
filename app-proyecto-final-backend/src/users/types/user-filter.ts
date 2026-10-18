import { Types } from "mongoose";


/*Principal user filter model */
export interface UserFilter { 
    search?: string; 
    isActive?: boolean; 
    roleId?: Types.ObjectId 
}

