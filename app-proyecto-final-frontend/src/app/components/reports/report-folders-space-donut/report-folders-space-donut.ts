import { Component, computed, input } from '@angular/core';
import { SpaceSlice } from '../../../core/ui/report-folders-shared/types/space-slice.model';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';


@Component({
  selector: 'app-report-folders-space-donut',
  standalone: true,
  imports: [],
  templateUrl: './report-folders-space-donut.html',
  styleUrl: './report-folders-space-donut.css',
})
/*Donut chart component with the space share of each folder */
export class ReportFoldersSpaceDonut {

  // Inputs
  slices = input.required<SpaceSlice[]>();
  size = input(240);

  readonly totalBytes = computed(() =>
    this.slices().reduce((acc, slice) => acc + slice.bytes, 0)
  );

  readonly totalLabel = computed(() => formatBytes(this.totalBytes()));

  // Helper method for conic gradient with one stop range per slice
  readonly gradient = computed(() => {
    if (this.totalBytes() === 0) return 'none';

    let accumulated = 0;
    const stops = this.slices().map(slice => {
      const start = accumulated;
      accumulated += slice.percent;
      return `${slice.color} ${start}% ${accumulated}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  });
}
