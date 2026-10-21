import { FolderContentReportItemResponse } from "../../../../features/report-folders/models/response/folder-content-report-item-response.model";
import { FolderTreeRow } from "../types/folder-tree-row.model";

//Folders first, then alphabetical
function compareItems(a: FolderContentReportItemResponse, b: FolderContentReportItemResponse): number {
  if (a.resourceType !== b.resourceType) return a.resourceType === 'FOLDER' ? -1 : 1;
  return a.resourceName.localeCompare(b.resourceName);
}

//Builds the flat list into a tree and flattens it in depth-first order.
export function buildFolderContentRows(items: FolderContentReportItemResponse[]): FolderTreeRow[] {
  const ids = new Set(items.map(item => item.resourceId));
  const children = new Map<string | null, FolderContentReportItemResponse[]>();

  for (const item of items) {
    const parentKey = item.parentFolderId && ids.has(item.parentFolderId) && item.parentFolderId !== item.resourceId
      ? item.parentFolderId
      : null;

    children.set(parentKey, [...(children.get(parentKey) ?? []), item]);
  }

  const rows: FolderTreeRow[] = [];

  const visit = (parentKey: string | null, depth: number): void => {
    const list = [...(children.get(parentKey) ?? [])].sort(compareItems);

    for (const item of list) {
      const childCount = children.get(item.resourceId)?.length ?? 0;
      rows.push({ item, depth, childCount });

      if (childCount > 0) visit(item.resourceId, depth + 1);
    }
  };

  visit(null, 0);
  return rows;
}
