import { Component, input } from '@angular/core';
import { SpaceSlice } from '../../../core/ui/report-folders-shared/types/space-slice.model';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';

@Component({
  selector: 'app-report-folders-space-legend',
  standalone: true,
  imports: [],
  templateUrl: './report-folders-space-legend.html',
  styleUrl: './report-folders-space-legend.css',
})
/*Legend of the space donut with size, files and share of each folder */
export class ReportFoldersSpaceLegend {

  // Inputs
  slices = input.required<SpaceSlice[]>();

  // Helper: size label
  label(slice: SpaceSlice): string {
    return formatBytes(slice.bytes);
  }
}
