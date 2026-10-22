import { FolderContentReportItemResponse } from "../../../../features/report-folders/models/response/folder-content-report-item-response.model";

/* View model of one row of the flattened folder content tree */
export interface FolderTreeRow {
  item: FolderContentReportItemResponse;
  depth: number;
  childCount: number;
}
