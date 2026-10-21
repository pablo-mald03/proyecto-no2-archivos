import { Component, input } from '@angular/core';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';

@Component({
  selector: 'app-report-folders-kpi-strip',
  standalone: true,
  imports: [],
  templateUrl: './report-folders-kpi-strip.html',
  styleUrl: './report-folders-kpi-strip.css',
})
/*Summary strip component with the KPI tiles for the folders report */
export class ReportFoldersKpiStrip {

  // Inputs
  items = input.required<KpiItem[]>();
}
