import { Component, input } from '@angular/core';
import { KpiItem } from '../../../core/ui/report-shares-shared/types/kpi-item.model';

@Component({
  selector: 'app-report-shares-kpi-strip',
  standalone: true,
  imports: [],
  templateUrl: './report-shares-kpi-strip.html',
  styleUrl: './report-shares-kpi-strip.css',
})
/*Summary strip with the KPI tiles of a shares report */
export class ReportSharesKpiStrip {

  // Inputs
  items = input.required<KpiItem[]>();
}
