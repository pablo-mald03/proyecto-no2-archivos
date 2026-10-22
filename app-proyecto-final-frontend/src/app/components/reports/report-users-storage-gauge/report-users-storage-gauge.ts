import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { getStorageUsageLevel, STORAGE_CRITICAL_THRESHOLD, STORAGE_WARNING_THRESHOLD } from '../../../core/ui/report-users-shared/utils/storage-usage.util';
import { STORAGE_LEVEL_STYLES } from '../../../core/ui/report-users-shared/utils/storage-usage-level-style.util';

//Ring geometry (viewBox 100)
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-report-users-storage-gauge',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './report-users-storage-gauge.html',
  styleUrl: './report-users-storage-gauge.css',
})
/*Circular gauge that shows the percentage of storage used */
export class ReportUsersStorageGauge {

  // Inputs
  percent = input.required<number>();
  size = input(128);

  readonly radius = RADIUS;

  //Threshold marks drawn around the ring
  readonly ticks = [STORAGE_WARNING_THRESHOLD, STORAGE_CRITICAL_THRESHOLD].map(percent => ({
    percent,
    angle: percent * 3.6
  }));

  // Percent limited to the ring range
  readonly clamped = computed(() => Math.min(100, Math.max(0, this.percent())));

  // Dash that draws the progress
  readonly dashArray = computed(() =>
    `${(this.clamped() / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`
  );

  // Colors according to the usage level
  readonly styles = computed(() => STORAGE_LEVEL_STYLES[getStorageUsageLevel(this.percent())]);
}
