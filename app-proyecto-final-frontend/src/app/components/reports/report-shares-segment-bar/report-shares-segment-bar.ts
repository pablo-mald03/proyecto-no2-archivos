import { Component, computed, input } from '@angular/core';
import { SegmentItem } from '../../../core/ui/report-shares-shared/types/segment-item.model';

@Component({
  selector: 'app-report-shares-segment-bar',
  standalone: true,
  imports: [],
  templateUrl: './report-shares-segment-bar.html',
  styleUrl: './report-shares-segment-bar.css',
})
/*Segmented bar with legend to show a distribution component */
export class ReportSharesSegmentBar {

  // Inputs
  segments = input.required<SegmentItem[]>();

  readonly total = computed(() =>
    Math.max(this.segments().reduce((acc, segment) => acc + segment.count, 0), 1)
  );

  // Helper method: segment width
  widthOf(segment: SegmentItem): number {
    return (segment.count / this.total()) * 100;
  }
}
