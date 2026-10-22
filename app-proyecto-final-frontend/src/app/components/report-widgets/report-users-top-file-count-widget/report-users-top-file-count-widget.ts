import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideCrown, lucideFiles } from '@ng-icons/lucide';
import { ReportWidgetFrame } from '../../common/report-widget-frame/report-widget-frame';
import { ReportUsersAvatar } from '../../reports/report-users-avatar/report-users-avatar';
import { TopUserByFileCountResponse } from '../../../features/report-users/models/response/top-user-by-file-count-response.model';
import { toPodiumEntryByFileCount } from '../../../core/ui/report-users-shared/utils/podium-entry.mapper';
import { PodiumEntry } from '../../../core/ui/report-users-shared/types/podium-entry.model';

@Component({
  selector: 'app-report-users-top-file-count-widget',
  standalone: true,
  host: { class: 'block h-full' },
  imports: [NgIcon, ReportWidgetFrame, ReportUsersAvatar],
  templateUrl: './report-users-top-file-count-widget.html',
  styleUrl: './report-users-top-file-count-widget.css',
})
/*Compact podium of the top users by file count component */
export class ReportUsersTopFileCountWidget {

  // Inputs
  users = input.required<TopUserByFileCountResponse[]>();
  loading = input(false);
  limit = input(5);
  showViewMore = input(false);

  // Outputs
  viewMore = output<void>();

  readonly lucideFilesIcon = lucideFiles;
  readonly lucideCrownIcon = lucideCrown;

  readonly entries = computed(() =>
    this.users().slice(0, this.limit()).map(toPodiumEntryByFileCount)
  );

  readonly podiumOrder = computed(() => {
    const [first, second, third] = this.entries();
    return [second, first, third].filter((e): e is PodiumEntry => !!e);
  });

  readonly rest = computed(() => this.entries().slice(3));

  podiumPosition(entry: PodiumEntry): 1 | 2 | 3 {
    return (this.entries().indexOf(entry) + 1) as 1 | 2 | 3;
  }

  // Helper method to step height and colors
  stepClass(position: 1 | 2 | 3): string {
    switch (position) {
      case 1: return 'h-14 from-yellow-500/30 to-yellow-500/5 border-yellow-500/50';
      case 2: return 'h-10 from-slate-300/20 to-slate-300/5 border-slate-300/40';
      case 3: return 'h-8 from-amber-700/20 to-amber-700/5 border-amber-700/40';
    }
  }

  // Helper method to color of the position number
  numberClass(position: 1 | 2 | 3): string {
    switch (position) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-slate-300';
      case 3: return 'text-amber-500';
    }
  }

  // Helper method to ring color around the avatar
  ringClass(position: 1 | 2 | 3): string {
    switch (position) {
      case 1: return 'ring-yellow-500/70';
      case 2: return 'ring-slate-300/60';
      case 3: return 'ring-amber-700/60';
    }
  }
}
