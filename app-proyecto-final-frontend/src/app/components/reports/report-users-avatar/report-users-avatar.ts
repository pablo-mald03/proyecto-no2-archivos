import { Component, computed, input } from '@angular/core';
import { AVATAR_PALETTES } from './constants/avatar-palettes.constant';


@Component({
  selector: 'app-report-users-avatar',
  standalone: true,
  host: { class: 'inline-flex' },
  imports: [],
  templateUrl: './report-users-avatar.html',
  styleUrl: './report-users-avatar.css',
})
/*Avatar with the initials of a user */
export class ReportUsersAvatar {

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
