import { ResourceType } from "../../../report-shared/models/resource-type.model";

/* Folder content report item response model */
export interface FolderContentReportItemResponse {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  extension?: string | null;
  sizeBytes?: number | null;
  parentFolderId?: string | null;
  createdAt: string;
}
