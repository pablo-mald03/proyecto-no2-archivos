import { Component, computed, input } from '@angular/core';

//Palettes used to give each user a stable color
const AVATAR_PALETTES = [
  'bg-sky-950/60 text-sky-300',
  'bg-violet-950/60 text-violet-300',
  'bg-emerald-950/60 text-emerald-300',
  'bg-amber-950/60 text-amber-300',
  'bg-rose-950/60 text-rose-300',
  'bg-cyan-950/60 text-cyan-300'
];

@Component({
  selector: 'app-report-shares-avatar',
  standalone: true,
  host: { class: 'inline-flex' },
  imports: [],
  templateUrl: './report-shares-avatar.html',
  styleUrl: './report-shares-avatar.css',
})
/*Avatar with the initials of a user */
export class ReportSharesAvatar {

  // Inputs
  name = input.required<string>();
  size = input(40);

  // Initials 
  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';

    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  // Stable palette based on the name
  readonly palette = computed(() => {
    const hash = [...this.name()].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
  });
}
