import { ShareResourceType } from "../constants/share.constants";

/*Shared resource representation model */
export interface SharedResource {
    id: string;
    type: ShareResourceType;
    name: string;
    extension?: string;
    mimeType?: string;
    sizeBytes?: number;
    ownerId: string;
    ownerUsername: string,
    ownerEmail: string,
    createdAt: string;
    updatedAt: string;
}