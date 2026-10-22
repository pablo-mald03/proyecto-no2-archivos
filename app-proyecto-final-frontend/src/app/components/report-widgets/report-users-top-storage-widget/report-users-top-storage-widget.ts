import { Component, computed, input, output } from '@angular/core';
import { lucideHardDrive } from '@ng-icons/lucide';
import { ReportWidgetFrame } from '../../common/report-widget-frame/report-widget-frame';
import { ReportUsersAvatar } from '../../reports/report-users-avatar/report-users-avatar';
import { TopUserByStorageResponse } from '../../../features/report-users/models/response/top-user-by-storage-response.model';
import { calculateUsagePercent, getStorageUsageLevel } from '../../../core/ui/report-users-shared/utils/storage-usage.util';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';
import { STORAGE_LEVEL_STYLES } from '../../../core/ui/report-users-shared/utils/storage-usage-level-style.util';


@Component({
  selector: 'app-report-users-top-storage-widget',
  standalone: true,
  host: { class: 'block h-full' },
  imports: [ReportWidgetFrame, ReportUsersAvatar],
  templateUrl: './report-users-top-storage-widget.html',
  styleUrl: './report-users-top-storage-widget.css',
})
/*Compact ranking of the top users by storage used with their quota usage component */
export class ReportUsersTopStorageWidget {

  // Inputs
  users = input.required<TopUserByStorageResponse[]>();
  loading = input(false);
  limit = input(5);
  showViewMore = input(false);

  // Outputs
  viewMore = output<void>();

  readonly lucideHardDriveIcon = lucideHardDrive;

  readonly rows = computed(() =>
    this.users().slice(0, this.limit()).map(user => {
      const percent = calculateUsagePercent(user.usedBytes, user.quotaBytes);

      return {
        id: user.userId,
        name: user.fullName,
        percent,
        barWidth: Math.min(percent, 100),
        usedLabel: formatBytes(user.usedBytes),
        quotaLabel: formatBytes(user.quotaBytes),
        styles: STORAGE_LEVEL_STYLES[getStorageUsageLevel(percent)]
      };
    })
  );
}
