import { Component, computed, input } from '@angular/core';
import { IconType, NgIcon } from '@ng-icons/core';
import { lucideAward, lucideCrown, lucideMedal, lucideTrophy } from '@ng-icons/lucide';
import { ReportUsersAvatar } from '../report-users-avatar/report-users-avatar';
import { PodiumEntry } from '../../../core/ui/report-users-shared/types/podium-entry.model';
import { getStorageUsageLevel } from '../../../core/ui/report-users-shared/utils/storage-usage.util';
import { STORAGE_LEVEL_STYLES } from '../../../core/ui/report-users-shared/utils/storage-usage-level-style.util';

//Ring around the avatar (viewBox 72)
const RING_RADIUS = 32;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'app-report-users-podium',
  standalone: true,
  imports: [NgIcon, ReportUsersAvatar],
  templateUrl: './report-users-podium.html',
  styleUrl: './report-users-podium.css',
})
/*Podium-style visualization of a users ranking */
export class ReportUsersPodium {

  // Inputs
  entries = input.required<PodiumEntry[]>();

  /** Optional: unit label next to the main value (ej. archivos) */
  unitLabel = input('');

  /** Optional: show the username chip under the name */
  showUsername = input(true);

  //Icons and ring constants
  readonly lucideCrownIcon = lucideCrown;
  readonly ringRadius = RING_RADIUS;

  // Podium order (2nd, 1st, 3rd)
  readonly podiumOrder = computed(() => {
    const [first, second, third] = this.entries();
    return [second, first, third].filter((e): e is PodiumEntry => !!e);
  });

  // Rest of the entries (positions 4-10)
  readonly rest = computed(() => this.entries().slice(3));

  // Max value for scaling bars in the rest list
  readonly maxValue = computed(() =>
    Math.max(...this.entries().map(e => e.value), 1)
  );

  // Helper: podium position (1, 2 or 3)
  podiumPosition(entry: PodiumEntry): 1 | 2 | 3 {
    return (this.entries().indexOf(entry) + 1) as 1 | 2 | 3;
  }

  // Helper: height class for each podium step
  podiumHeight(position: 1 | 2 | 3): string {
    switch (position) {
      case 1: return 'h-40';
      case 2: return 'h-32';
      case 3: return 'h-24';
    }
  }

  // Helper: accent color for each podium step
  podiumAccent(position: 1 | 2 | 3): string {
    switch (position) {
      case 1: return 'from-yellow-500/30 to-yellow-500/5 border-yellow-500/50';
      case 2: return 'from-slate-300/20 to-slate-300/5 border-slate-300/40';
      case 3: return 'from-amber-700/20 to-amber-700/5 border-amber-700/40';
    }
  }

  // Helper: text color of the position number
  podiumTextClass(position: 1 | 2 | 3): string {
    switch (position) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-slate-300';
      case 3: return 'text-amber-500';
    }
  }

  // Helper: medal badge colors
  medalBadgeClass(position: 1 | 2 | 3): string {
    switch (position) {
      case 1: return 'bg-yellow-500 text-yellow-950';
      case 2: return 'bg-slate-300 text-slate-900';
      case 3: return 'bg-amber-700 text-amber-100';
    }
  }

  // Helper: medal icon object
  podiumIcon(position: 1 | 2 | 3): IconType {
    switch (position) {
      case 1: return lucideTrophy;
      case 2: return lucideMedal;
      case 3: return lucideAward;
    }
  }

  // Helper: the champion step rises last
  stepDelay(position: 1 | 2 | 3): number {
    return (4 - position) * 120;
  }

  // Helper: ring dash (full ring when the entry has no progress)
  ringDash(entry: PodiumEntry): string {
    const percent = entry.progress === undefined ? 100 : Math.min(100, Math.max(0, entry.progress));
    return `${(percent / 100) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
  }

  // Helper: ring color (usage level when it has progress, medal color otherwise)
  ringStrokeClass(entry: PodiumEntry): string {
    if (entry.progress !== undefined) {
      return STORAGE_LEVEL_STYLES[getStorageUsageLevel(entry.progress)].stroke;
    }

    switch (this.podiumPosition(entry)) {
      case 1: return 'stroke-yellow-500';
      case 2: return 'stroke-slate-300';
      case 3: return 'stroke-amber-700';
    }
  }

  // Helper: text color of the quota percentage
  ringTextClass(entry: PodiumEntry): string {
    return STORAGE_LEVEL_STYLES[getStorageUsageLevel(entry.progress ?? 0)].text;
  }

  // Helper: bar width for the rest list
  restBarWidth(entry: PodiumEntry): number {
    return (entry.value / this.maxValue()) * 100;
  }

  // Helper: bar color for the rest list
  restBarClass(entry: PodiumEntry): string {
    return entry.progress !== undefined
      ? STORAGE_LEVEL_STYLES[getStorageUsageLevel(entry.progress)].gradient
      : 'from-sky-500 to-cyan-400';
  }
}
