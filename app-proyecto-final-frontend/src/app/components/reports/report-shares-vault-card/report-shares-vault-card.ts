import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideLock } from '@ng-icons/lucide';
import { NeverSharedFileResponse } from '../../../features/report-shares/models/response/never-shared-file-response.model';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';
import { AGE_BUCKET_STYLES } from '../../../core/ui/report-shares-shared/utils/age-bucket-style.util';
import { formatRelativeAge, getAgeBucket, getAgeInDays } from '../../../core/ui/report-shares-shared/utils/age-bucket.util';


@Component({
  selector: 'app-report-shares-vault-card',
  standalone: true,
  imports: [NgIcon, DatePipe],
  templateUrl: './report-shares-vault-card.html',
  styleUrl: './report-shares-vault-card.css',
})
/*Dashed "vault" card of a file that has never been shared, colored by its age */
export class ReportSharesVaultCard {

  // Inputs
  file = input.required<NeverSharedFileResponse>();
  maxSize = input.required<number>();

  readonly lucideLockIcon = lucideLock;

  readonly days = computed(() => getAgeInDays(this.file().createdAt));
  readonly bucket = computed(() => getAgeBucket(this.days()));
  readonly styles = computed(() => AGE_BUCKET_STYLES[this.bucket()]);
  readonly ageLabel = computed(() => formatRelativeAge(this.days()));
  readonly sizeLabel = computed(() => formatBytes(this.file().sizeBytes));
  readonly sizePercent = computed(() => (this.file().sizeBytes / Math.max(this.maxSize(), 1)) * 100);
}
