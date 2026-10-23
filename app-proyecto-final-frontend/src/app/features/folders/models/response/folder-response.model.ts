import { ResourcePermissions } from "../../../shares/models/resource-permissions.model";

/*Folder response model representation */
export interface FolderResponse {
  id: string;
  ownerId: string;
  parentId: string | null;
  name: string;
  ancestors: string[];
  createdAt: string;
  updatedAt: string;
  permissions: ResourcePermissions;
}
