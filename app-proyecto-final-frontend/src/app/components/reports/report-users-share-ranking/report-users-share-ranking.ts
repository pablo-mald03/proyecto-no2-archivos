import { Component, computed, input } from '@angular/core';
import { ReportUsersAvatar } from '../report-users-avatar/report-users-avatar';
import { UserShareCountResponse } from '../../../features/report-users/models/response/user-share-count-response.model';

//Number of segments of the meter
const SEGMENTS_COUNT = 10;

@Component({
  selector: 'app-report-users-share-ranking',
  standalone: true,
  imports: [ReportUsersAvatar],
  templateUrl: './report-users-share-ranking.html',
  styleUrl: './report-users-share-ranking.css',
})
/*Ranking list with a segmented meter of the share count of each user */
export class ReportUsersShareRanking {

  // Inputs
  users = input.required<UserShareCountResponse[]>();

  /** Offset to keep the ranking position across pages */
  rankOffset = input(0);

  readonly segments = Array.from({ length: SEGMENTS_COUNT }, (_, index) => index);

  // Max value for scaling the meters
  readonly maxShares = computed(() =>
    Math.max(...this.users().map(u => u.shareCount), 1)
  );

  // Helper: ranking position
  rankFor(index: number): number {
    return this.rankOffset() + index + 1;
  }

  // Helper: filled segments of the meter 
  filledSegments(user: UserShareCountResponse): number {
    if (user.shareCount <= 0) return 0;
    return Math.max(1, Math.round((user.shareCount / this.maxShares()) * SEGMENTS_COUNT));
  }

  // Helper: medal colors for the top 3 positions
  rankClass(rank: number): string {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-yellow-950';
      case 2: return 'bg-slate-300 text-slate-900';
      case 3: return 'bg-amber-700 text-amber-100';
      default: return 'bg-surface-raised text-text-muted';
    }
  }
}
