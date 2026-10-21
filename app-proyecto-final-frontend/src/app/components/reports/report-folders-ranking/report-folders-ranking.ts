import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FolderWithMostFilesResponse } from '../../../features/report-folders/models/response/folder-with-most-files-response.model';

@Component({
  selector: 'app-report-folders-ranking',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './report-folders-ranking.html',
  styleUrl: './report-folders-ranking.css',
})
/*Ranking list of the folders with the most files */
export class ReportFoldersRanking {

  // Inputs
  folders = input.required<FolderWithMostFilesResponse[]>();

  // Offset to keep the ranking position across pages
  rankOffset = input(0);

  // Max value for scaling the bars
  readonly maxFiles = computed(() =>
    Math.max(...this.folders().map(f => f.fileCount), 1)
  );

  // Helper method for ranking position
  rankFor(index: number): number {
    return this.rankOffset() + index + 1;
  }

  // Helper method for bar width
  barWidth(folder: FolderWithMostFilesResponse): number {
    return (folder.fileCount / this.maxFiles()) * 100;
  }

  // Helper method for medal colors for the top 3 positions
  rankClass(rank: number): string {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-yellow-950';
      case 2: return 'bg-slate-300 text-slate-900';
      case 3: return 'bg-amber-700 text-amber-100';
      default: return 'bg-surface-raised text-text-muted';
    }
  }
}
