import {
  Component,
  inject,
  output
} from '@angular/core';
import { Router } from '@angular/router';

import {
  NgIcon,
  provideIcons
} from '@ng-icons/core';
import { lucideMenu, lucideUserRound } from '@ng-icons/lucide';


@Component({
  selector: 'app-topbar',

  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideMenu })],

  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {

  readonly lucideUserRoundIcon = lucideUserRound;

  private readonly router = inject(Router);

  menuToggle = output<void>();

  goToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
  }
}