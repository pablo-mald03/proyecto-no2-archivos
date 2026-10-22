import { FolderContentReportItemResponse } from "../../../../features/report-folders/models/response/folder-content-report-item-response.model";
import { ExtensionStat } from "../types/extension-stat.model";
import { paletteColor } from "./space-palette.util";

const MAX_EXTENSIONS = 6;

//Groups the files by extension (the least frequent ones are merged into "otras")
export function buildExtensionStats(items: FolderContentReportItemResponse[]): ExtensionStat[] {
  const files = items.filter(item => item.resourceType === 'FILE');
  const groups = new Map<string, { count: number; bytes: number }>();

  for (const file of files) {
    const key = file.extension?.trim().toLowerCase() || 'sin extensión';
    const group = groups.get(key) ?? { count: 0, bytes: 0 };

    groups.set(key, { count: group.count + 1, bytes: group.bytes + (file.sizeBytes ?? 0) });
  }

  const sorted = [...groups.entries()]
    .map(([extension, group]) => ({ extension, ...group }))
    .sort((a, b) => b.count - a.count);

  const main = sorted.slice(0, MAX_EXTENSIONS);
  const rest = sorted.slice(MAX_EXTENSIONS);

  if (rest.length > 0) {
    main.push({
      extension: 'otras',
      count: rest.reduce((acc, group) => acc + group.count, 0),
      bytes: rest.reduce((acc, group) => acc + group.bytes, 0)
    });
  }

  return main.map((group, index) => ({
    ...group,
    percent: files.length > 0 ? (group.count / files.length) * 100 : 0,
    color: paletteColor(index)
  }));
}
