import {
  Component,
  inject,
  input,
  output
} from '@angular/core';

import {
  NgIcon,
  provideIcons
} from '@ng-icons/core';

import {
  lucideLogOut,
  lucideX
} from '@ng-icons/lucide';

import {
  SidebarNav
} from '../sidebar-nav/sidebar-nav';
import { AuthState } from '../../../stores/auth.state';

@Component({
  selector: 'app-mobile-sidebar',

  imports: [
    NgIcon,
    SidebarNav
  ],

  providers: [
    provideIcons({
      lucideX
    })
  ],

  templateUrl: './mobile-sidebar.html',
  styleUrl: './mobile-sidebar.css'
})
/*Moble side bar component */
export class MobileSidebar {


  readonly lucideLogOutIcon = lucideLogOut;

  //PROPS
  open = input(false);

  closed = output<void>();

  logoutClicked = output<void>();

  private readonly authState = inject(AuthState);

  readonly user = this.authState.user;

  /*Method to send the logout signal*/
  logout(): void {

    this.logoutClicked.emit();

  }

}