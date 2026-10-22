import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideFolder, lucideFolderOpen } from '@ng-icons/lucide';
import { ReportWidgetFrame } from '../../common/report-widget-frame/report-widget-frame';
import { FolderWithMostFilesResponse } from '../../../features/report-folders/models/response/folder-with-most-files-response.model';

//Tile size ranges in px
const MIN_BASIS = 96;
const MAX_BASIS = 170;
const MIN_HEIGHT = 84;
const MAX_HEIGHT = 120;

@Component({
  selector: 'app-report-folders-most-files-widget',
  standalone: true,
  host: { class: 'block h-full' },
  imports: [NgIcon, ReportWidgetFrame],
  templateUrl: './report-folders-most-files-widget.html',
  styleUrl: './report-folders-most-files-widget.css',
})
/*Compact mosaic of the folders with the most files component */
export class ReportFoldersMostFilesWidget {

  // Inputs
  folders = input.required<FolderWithMostFilesResponse[]>();
  loading = input(false);
  limit = input(5);
  showViewMore = input(false);

  // Outputs
  viewMore = output<void>();

  readonly lucideFolderOpenIcon = lucideFolderOpen;
  readonly lucideFolderIcon = lucideFolder;

  readonly tiles = computed(() => {
    const folders = this.folders().slice(0, this.limit());
    const max = Math.max(...folders.map(folder => folder.fileCount), 1);

    return folders.map((folder, index) => {
      const ratio = folder.fileCount / max;

      return {
        id: folder.folderId,
        name: folder.folderName,
        owner: folder.ownerUsername,
        count: folder.fileCount,
        rank: index + 1,
        grow: Math.max(folder.fileCount, 1),
        basis: Math.round(MIN_BASIS + ratio * (MAX_BASIS - MIN_BASIS)),
        height: Math.round(MIN_HEIGHT + ratio * (MAX_HEIGHT - MIN_HEIGHT)),
        numberSize: Math.round(20 + ratio * 12),
        delay: index * 70,
        toneClass: this.toneClass(ratio)
      };
    });
  });

  // Helper: color tone according to the ratio against the max
  private toneClass(ratio: number): string {
    if (ratio >= 0.66) return 'from-amber-500/35 to-yellow-400/5 border-amber-400/50 text-amber-100';
    if (ratio >= 0.33) return 'from-sky-500/35 to-cyan-400/5 border-sky-400/40 text-sky-100';
    return 'from-violet-500/30 to-indigo-400/5 border-violet-400/30 text-violet-100';
  }
}
