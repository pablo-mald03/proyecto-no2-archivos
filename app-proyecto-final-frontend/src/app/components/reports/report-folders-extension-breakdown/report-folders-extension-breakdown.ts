import { Component, computed, input } from '@angular/core';
import { FolderContentReportItemResponse } from '../../../features/report-folders/models/response/folder-content-report-item-response.model';
import { buildExtensionStats } from '../../../core/ui/report-folders-shared/utils/build-extension-stats.util';
import { ExtensionStat } from '../../../core/ui/report-folders-shared/types/extension-stat.model';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';


@Component({
  selector: 'app-report-folders-extension-breakdown',
  standalone: true,
  imports: [],
  templateUrl: './report-folders-extension-breakdown.html',
  styleUrl: './report-folders-extension-breakdown.css',
})
/*Breakdown of the files by extension component */
export class ReportFoldersExtensionBreakdown {

  // Inputs
  items = input.required<FolderContentReportItemResponse[]>();

  readonly stats = computed(() => buildExtensionStats(this.items()));

  // Helper method for files count and size label
  label(stat: ExtensionStat): string {
    return `${stat.count} ${stat.count === 1 ? 'archivo' : 'archivos'} · ${formatBytes(stat.bytes)}`;
  }
}
