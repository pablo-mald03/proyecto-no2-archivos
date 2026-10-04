import { Component, computed, inject, input, output } from '@angular/core';
import { AuthState } from '../../../stores/auth.state';
import { DRIVE_NAV_OPTIONS } from './constants/drive-nav.options';
import { DriveNavItem } from '../drive-nav-item/drive-nav-item';

@Component({
  selector: 'app-drive-nav',
  imports: [DriveNavItem],
  templateUrl: './drive-nav.html',
  styleUrl: './drive-nav.css',
})
//Principal drive nav component
export class DriveNav {
  private readonly authState = inject(AuthState);

  collapsed = input(false);
  optionSelected = output<void>();

  readonly options = computed(() =>
    DRIVE_NAV_OPTIONS.filter(option => !option.permission || this.authState.hasPermission(option.permission))
  );
}