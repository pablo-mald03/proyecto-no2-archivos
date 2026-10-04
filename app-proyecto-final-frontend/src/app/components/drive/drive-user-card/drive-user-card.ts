import { Component, computed, inject, input, output } from '@angular/core';
import { AuthState } from '../../../stores/auth.state';
import { lucideLogOut } from '@ng-icons/lucide';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-drive-user-card',
  imports: [NgIcon],
  templateUrl: './drive-user-card.html',
  styleUrl: './drive-user-card.css',
})
//Principal drive user card component
export class DriveUserCard {
  private readonly authState = inject(AuthState);

  readonly lucideLogOutIcon = lucideLogOut;
  readonly user = this.authState.user;

  //Props
  collapsed = input(false);
  logoutClicked = output<void>();

  readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  readonly initials = computed(() => {
    const user = this.user();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  });
}