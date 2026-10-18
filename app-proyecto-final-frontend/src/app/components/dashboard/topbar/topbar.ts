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
import { AuthState } from '../../../stores/auth.state';


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
  private readonly authState = inject(AuthState);

  menuToggle = output<void>();

  goToProfile(): void {
    const user = this.authState.user();
    
    if (user?.roleCode === 'USER') {
      this.router.navigate(['/drive/profile']);
    } else {
      this.router.navigate(['/dashboard/profile']);
    }
  }
}