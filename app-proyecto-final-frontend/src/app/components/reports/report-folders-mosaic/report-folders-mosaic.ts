import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideFolder } from '@ng-icons/lucide';
import { FolderWithMostFilesResponse } from '../../../features/report-folders/models/response/folder-with-most-files-response.model';
import { MAX_BASIS, MAX_HEIGHT, MIN_BASIS, MIN_HEIGHT } from './constants/report-folder-mosaic.constant';


@Component({
  selector: 'app-report-folders-mosaic',
  standalone: true,
  imports: [NgIcon],
  templateUrl: './report-folders-mosaic.html',
  styleUrl: './report-folders-mosaic.css',
})
/*Mosaic of folders where the area of each tile depends on its file count */
export class ReportFoldersMosaic {

  // Inputs
  folders = input.required<FolderWithMostFilesResponse[]>();

  /** Offset to keep the ranking position across pages (page * size) */
  rankOffset = input(0);

  readonly lucideFolderIcon = lucideFolder;

  // Max value for scaling the tiles
  readonly maxFiles = computed(() =>
    Math.max(...this.folders().map(f => f.fileCount), 1)
  );

  readonly tiles = computed(() =>
    this.folders().map((folder, index) => {
      const ratio = folder.fileCount / this.maxFiles();

      return {
        folder,
        rank: this.rankOffset() + index + 1,
        grow: Math.max(folder.fileCount, 1),
        basis: Math.round(MIN_BASIS + ratio * (MAX_BASIS - MIN_BASIS)),
        height: Math.round(MIN_HEIGHT + ratio * (MAX_HEIGHT - MIN_HEIGHT)),
        numberSize: Math.round(26 + ratio * 22),
        delay: index * 70,
        toneClass: this.toneClass(ratio)
      };
    })
  );

  // Helper method for color tone according to the ratio against the max
  private toneClass(ratio: number): string {
    if (ratio >= 0.66) return 'from-amber-500/35 to-yellow-400/5 border-amber-400/50 text-amber-100';
    if (ratio >= 0.33) return 'from-sky-500/35 to-cyan-400/5 border-sky-400/40 text-sky-100';
    return 'from-violet-500/30 to-indigo-400/5 border-violet-400/30 text-violet-100';
  }
}
