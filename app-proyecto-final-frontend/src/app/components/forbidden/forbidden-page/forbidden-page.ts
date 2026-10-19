import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../../../stores/auth.state';
import { lucideArrowLeft, lucideHouse, lucideShieldAlert } from '@ng-icons/lucide';
import { CustomButton } from '../../common/custom-button/custom-button';
import { NgIcon, NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [CustomButton, NgIconComponent],
  templateUrl: './forbidden-page.html',
  styleUrl: './forbidden-page.css',
})
//Forbidden page component
export class ForbiddenPage {
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);

  // Icons
  readonly lucideShieldAlertIcon = lucideShieldAlert;
  readonly lucideHomeIcon = lucideHouse;
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Redirection to the module
  goHome(): void {
    const user = this.authState.user();

    if (user?.roleCode === 'USER') {
      this.router.navigate(['/drive']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  goBack(): void {
    window.history.back();
  }
}