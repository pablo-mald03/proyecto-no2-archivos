import { Component, computed, input } from '@angular/core';
import { ReportUsersAvatar } from '../report-users-avatar/report-users-avatar';
import { ReportUsersStorageGauge } from '../report-users-storage-gauge/report-users-storage-gauge';
import { UserStoragePercentageResponse } from '../../../features/report-users/models/response/user-storage-percentage-response.model';
import { getStorageUsageLevel } from '../report-users-shared/utils/storage-usage.util';
import { STORAGE_LEVEL_STYLES } from '../report-users-shared/utils/storage-usage-level-style.util';
import { formatBytes } from '../report-users-shared/utils/format-bytes.util';


@Component({
  selector: 'app-report-users-storage-card',
  standalone: true,
  imports: [ReportUsersAvatar, ReportUsersStorageGauge],
  templateUrl: './report-users-storage-card.html',
  styleUrl: './report-users-storage-card.css',
})
/*Card with the storage usage gauge of one user */
export class ReportUsersStorageCard {

  // Inputs
  user = input.required<UserStoragePercentageResponse>();

  readonly level = computed(() => getStorageUsageLevel(this.user().percentageUsed));
  readonly styles = computed(() => STORAGE_LEVEL_STYLES[this.level()]);

  readonly usedLabel = computed(() => formatBytes(this.user().usedBytes));
  readonly quotaLabel = computed(() => formatBytes(this.user().quotaBytes));
  readonly freeLabel = computed(() =>
    formatBytes(Math.max(this.user().quotaBytes - this.user().usedBytes, 0))
  );
}
