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
  lucidePanelLeftClose,
  lucidePanelLeftOpen
} from '@ng-icons/lucide';

import { SidebarNav } from '../sidebar-nav/sidebar-nav';
import { AuthState } from '../../../stores/auth.state';

@Component({
  selector: 'app-sidebar',

  imports: [
    NgIcon,
    SidebarNav
  ],

  providers: [
    provideIcons({
      lucidePanelLeftClose,
      lucidePanelLeftOpen
    })
  ],

  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
/*Sidebar actions module*/
export class Sidebar {

  readonly lucideLogOutIcon = lucideLogOut;

  //Props
  collapsed = input(false);

  toggle = output<void>();

  logoutClicked = output<void>();

  private readonly authState = inject(AuthState);

  readonly user = this.authState.user;


  /*Method to send the logout signal*/
  logout(): void {

    this.logoutClicked.emit();

  }

}