import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomButton } from '../../common/custom-button/custom-button';
import { User } from '../../../features/users/models/user.model';
import { lucideMail, lucidePencil, lucidePhone, lucidePower, lucideShieldCheck, lucideUserRound } from '@ng-icons/lucide';
import { CardActionsDirective } from '../../common/custom-card/types/card-actions.directive';
import { DatePipe } from '@angular/common';
import { AuthState } from '../../../stores/auth.state';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [
    NgIcon,
    DatePipe,
    CustomCard,
    CustomButton,
    CardActionsDirective
  ],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
/*Principal card representation for all information of users */
export class UserCard {
  user = input.required<User>();

  canEdit = input(false);
  canChangeStatus = input(false);

  editClicked = output<User>();
  statusClicked = output<User>();

  private readonly authState = inject(AuthState);

  readonly lucideUserIcon = lucideUserRound;
  readonly lucideMailIcon = lucideMail;
  readonly lucidePhoneIcon = lucidePhone;
  readonly lucideShieldIcon = lucideShieldCheck;
  readonly lucideEditIcon = lucidePencil;
  readonly lucidePowerIcon = lucidePower;

  readonly hasDriveAccess = computed(() =>
    this.authState.hasPermission('DRIVE_ACCESS')
  );

  readonly storagePercentage = computed(() => {
    const { usedBytes, quotaBytes } = this.user().storage;

    if (quotaBytes <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (usedBytes / quotaBytes) * 100));
  });

  formatBytes(bytes: number): string {
    if (bytes < 0) {
      return '0 B';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
  }

  edit(): void {
    this.editClicked.emit(this.user());
  }

  toggleStatus(): void {
    this.statusClicked.emit(this.user());
  }
}