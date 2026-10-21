import { Component, computed, input } from '@angular/core';
import { UserShareCountResponse } from '../../../features/report-users/models/response/user-share-count-response.model';

//Bubble size range in px
const MIN_SIZE = 64;
const MAX_SIZE = 132;

@Component({
  selector: 'app-report-users-share-bubbles',
  standalone: true,
  imports: [],
  templateUrl: './report-users-share-bubbles.html',
  styleUrl: './report-users-share-bubbles.css',
})
/*Bubble cloud where the size of each bubble depends on the share count */
export class ReportUsersShareBubbles {

  // Inputs
  users = input.required<UserShareCountResponse[]>();

  // Max value for scaling the bubbles
  readonly maxShares = computed(() =>
    Math.max(...this.users().map(u => u.shareCount), 1)
  );

  readonly bubbles = computed(() =>
    this.users().map((user, index) => {
      const ratio = user.shareCount / this.maxShares();

      return {
        user,
        size: Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE)),
        delay: index * 350,
        tierClass: this.tierClass(ratio)
      };
    })
  );

  // Helper: color tier according to the ratio against the max
  private tierClass(ratio: number): string {
    if (ratio >= 0.66) return 'from-amber-500/40 to-yellow-400/10 border-amber-400/60 text-amber-200';
    if (ratio >= 0.33) return 'from-sky-500/40 to-cyan-400/10 border-sky-400/50 text-sky-200';
    return 'from-violet-500/30 to-indigo-400/10 border-violet-400/40 text-violet-200';
  }
}
