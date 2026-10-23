import { ResourcePermissions } from "../../../shares/models/resource-permissions.model";

/*File response model representation */
export interface FileResponse {
  id: string;
  ownerId: string;
  folderId: string | null;
  name: string;
  extension: 'txt' | 'md' | string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  permissions: ResourcePermissions;
}
