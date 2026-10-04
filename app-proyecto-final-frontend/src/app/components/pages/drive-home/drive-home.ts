import { Component, computed, inject } from '@angular/core';
import { AuthState } from '../../../stores/auth.state';
import { DRIVE_NAV_OPTIONS } from '../../drive/drive-nav/constants/drive-nav.options';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';

@Component({
  selector: 'app-drive-home',
  imports: [RouterLink, NgIcon, CustomCard],
  templateUrl: './drive-home.html',
  styleUrl: './drive-home.css',
})
//Principal dirve home component page
export class DriveHome {
  //Dependencies
  private readonly authState = inject(AuthState);

  readonly firstName = computed(() => this.authState.user()?.firstName ?? '');
  readonly shortcuts = DRIVE_NAV_OPTIONS;
}