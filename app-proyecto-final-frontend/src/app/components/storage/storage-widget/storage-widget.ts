import { Component, OnInit, computed, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideHardDrive } from '@ng-icons/lucide';
import { StorageState } from '../../../stores/storage.state';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';


@Component({
  selector: 'app-storage-widget',
  standalone: true,
  imports: [NgIcon],
  templateUrl: './storage-widget.html',
  styleUrl: './storage-widget.css',
})
// Reutilizable storage widget card
export class StorageWidget implements OnInit {
  private readonly storage = inject(StorageState);

  readonly compact = input(false);

  readonly usage = this.storage.usage;
  readonly percentage = this.storage.percentage;
  readonly level = this.storage.level;

  readonly lucideHardDriveIcon = lucideHardDrive;
  readonly formatBytes = formatBytes;

  readonly summary = computed(() => {
    const u = this.usage();
    if (!u) return '';
    return `${formatBytes(u.usedBytes)} de ${formatBytes(u.quotaBytes)} usados`;
  });

  readonly barClass = computed(() => {
    switch (this.level()) {
      case 'full': return 'bg-rose-500';
      case 'warn': return 'bg-amber-500';
      default: return 'bg-linear-to-r from-primary/80 to-primary';
    }
  });

  ngOnInit(): void {
    this.storage.ensureLoaded();
  }
}
