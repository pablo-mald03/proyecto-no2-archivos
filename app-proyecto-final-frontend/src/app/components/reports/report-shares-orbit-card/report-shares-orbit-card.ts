import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideFile } from '@ng-icons/lucide';
import { MostSharedFileResponse } from '../../../features/report-shares/models/response/most-shared-file-response.model';

//Orbit geometry in px
const ORBIT_RADIUS = 70;
const MAX_DOTS = 12;

@Component({
  selector: 'app-report-shares-orbit-card',
  standalone: true,
  imports: [NgIcon],
  templateUrl: './report-shares-orbit-card.html',
  styleUrl: './report-shares-orbit-card.css',
})
/*Card where each user the file is shared component*/
export class ReportSharesOrbitCard {

  // Inputs
  file = input.required<MostSharedFileResponse>();
  rank = input.required<number>();
  maxShares = input.required<number>();

  readonly lucideFileIcon = lucideFile;

  // Ratio against the most shared file
  readonly ratio = computed(() => this.file().shareCount / Math.max(this.maxShares(), 1));

  // The more shares, the faster the orbit
  readonly spinSeconds = computed(() => Math.round(30 - this.ratio() * 18));

  // Dots of the orbit (one per user, up to the max)
  readonly dots = computed(() => {
    const count = Math.min(this.file().shareCount, MAX_DOTS);

    return Array.from({ length: count }, (_, index) => ({
      index,
      transform: `rotate(${(360 / count) * index}deg) translateY(-${ORBIT_RADIUS}px)`
    }));
  });

  // Shares that do not fit in the orbit
  readonly extraShares = computed(() => Math.max(this.file().shareCount - MAX_DOTS, 0));

  // Colors according to the ratio
  readonly tone = computed(() => {
    const ratio = this.ratio();

    if (ratio >= 0.66) {
      return {
        card: 'from-amber-500/15 border-amber-400/40',
        ring: 'border-amber-400/30',
        center: 'border-amber-400/50 bg-amber-950/50 text-amber-300',
        dot: '#fbbf24'
      };
    }

    if (ratio >= 0.33) {
      return {
        card: 'from-sky-500/15 border-sky-400/30',
        ring: 'border-sky-400/25',
        center: 'border-sky-400/40 bg-sky-950/50 text-sky-300',
        dot: '#38bdf8'
      };
    }

    return {
      card: 'from-violet-500/15 border-violet-400/25',
      ring: 'border-violet-400/20',
      center: 'border-violet-400/30 bg-violet-950/50 text-violet-300',
      dot: '#a78bfa'
    };
  });
}
