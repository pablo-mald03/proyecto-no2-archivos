import {
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';

import {
  SIDEBAR_OPTIONS
} from '../sidebar/options/sidebar.options';
import { AuthState } from '../../../stores/auth.state';
import { SidebarItem } from '../sidebar-item/sidebar-item';

@Component({
  selector: 'app-sidebar-nav',

  imports: [
    SidebarItem
  ],

  templateUrl: './sidebar-nav.html',

  styleUrl: './sidebar-nav.css'
})
//Principal sidebar nav class to define the options
export class SidebarNav {

  private readonly authState = inject(AuthState);

  collapsed =
    input(false);

  optionSelected =
    output<void>();

  readonly options =
    computed(() =>
      SIDEBAR_OPTIONS.filter(option =>
        !option.permission ||
        this.authState.hasPermission(
          option.permission
        )
      )
    );

}