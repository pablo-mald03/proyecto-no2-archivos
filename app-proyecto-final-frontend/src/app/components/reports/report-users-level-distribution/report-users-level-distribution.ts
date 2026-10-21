import { Component, computed, input } from '@angular/core';
import { LEVELS } from './constants/levels.constants';
import { STORAGE_LEVEL_STYLES } from '../report-users-shared/utils/storage-usage-level-style.util';
import { getStorageUsageLevel } from '../report-users-shared/utils/storage-usage.util';



@Component({
  selector: 'app-report-users-level-distribution',
  standalone: true,
  imports: [],
  templateUrl: './report-users-level-distribution.html',
  styleUrl: './report-users-level-distribution.css',
})
/*Segmented bar with the distribution of users component */
export class ReportUsersLevelDistribution {

  // Inputs
  percents = input.required<number[]>();

  readonly segments = computed(() => {
    const levels = this.percents().map(getStorageUsageLevel);
    const total = Math.max(levels.length, 1);

    return LEVELS.map(({ level, range }) => {
      const count = levels.filter(l => l === level).length;

      return {
        level,
        range,
        count,
        label: STORAGE_LEVEL_STYLES[level].label,
        bgClass: STORAGE_LEVEL_STYLES[level].bg,
        width: (count / total) * 100
      };
    });
  });
}
