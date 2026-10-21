import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconType, NgIcon } from '@ng-icons/core';
import { lucideFile, lucideFileText, lucideFolder } from '@ng-icons/lucide';
import { FolderContentReportItemResponse } from '../../../features/report-folders/models/response/folder-content-report-item-response.model';
import { buildFolderContentRows } from '../../../core/ui/report-folders-shared/utils/build-folder-content-rows.util';
import { FolderTreeRow } from '../../../core/ui/report-folders-shared/types/folder-tree-row.model';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';


@Component({
  selector: 'app-report-folders-content-tree',
  standalone: true,
  imports: [NgIcon, DatePipe],
  templateUrl: './report-folders-content-tree.html',
  styleUrl: './report-folders-content-tree.css',
})
/*Explorer-like tree with the content of a folder and its subfolders component*/
export class ReportFoldersContentTree {

  // Inputs
  items = input.required<FolderContentReportItemResponse[]>();

  // Flattened tree rows
  readonly rows = computed(() => buildFolderContentRows(this.items()));

  // Helper method for icon by resource type and extension
  rowIcon(row: FolderTreeRow): IconType {
    if (row.item.resourceType === 'FOLDER') return lucideFolder;

    const extension = row.item.extension?.toLowerCase();
    return extension === 'txt' || extension === 'md' ? lucideFileText : lucideFile;
  }

  // Helper method for icon colors
  iconClass(row: FolderTreeRow): string {
    if (row.item.resourceType === 'FOLDER') return 'bg-amber-950/40 text-amber-400';

    switch (row.item.extension?.toLowerCase()) {
      case 'md': return 'bg-sky-950/40 text-sky-400';
      case 'txt': return 'bg-slate-700/40 text-slate-300';
      default: return 'bg-violet-950/40 text-violet-400';
    }
  }

  // Helper  method for label size
  sizeLabel(row: FolderTreeRow): string {
    return row.item.sizeBytes == null ? '—' : formatBytes(row.item.sizeBytes);
  }
}
