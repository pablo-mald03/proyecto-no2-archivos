import { Component, input } from '@angular/core';
import { KpiItem } from '../report-users-shared/types/kpi-item.model';

@Component({
  selector: 'app-report-users-kpi-strip',
  standalone: true,
  imports: [],
  templateUrl: './report-users-kpi-strip.html',
  styleUrl: './report-users-kpi-strip.css',
})
/*Summary strip with the KPI tiles of a users report */
export class ReportUsersKpiStrip {

  // Inputs
  items = input.required<KpiItem[]>();
}
