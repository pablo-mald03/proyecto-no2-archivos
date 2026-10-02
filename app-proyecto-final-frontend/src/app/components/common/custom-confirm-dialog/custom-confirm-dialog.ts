import { Component, input, output } from '@angular/core';
import { CustomButton } from '../custom-button/custom-button';
import { NgIcon } from '@ng-icons/core';
import { ConfirmDialogType } from './types/confirm-dialog.types';
import { lucideBadgeAlert, lucideCheck, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-confirm-dialog',
  standalone: true,
  imports: [
    NgIcon,
    CustomButton
  ],
  templateUrl: './custom-confirm-dialog.html',
  styleUrl: './custom-confirm-dialog.css',
})
/*Principal custom confirm dialog */
export class CustomConfirmDialog {

  //Mutable states
  open = input(false);
  type = input<ConfirmDialogType>('warning');

  //Props
  title = input('¿Estás seguro?');
  message = input('');

  cancelLabel = input('Cancelar');
  confirmLabel = input('Aceptar');

  loading = input(false);

  //Signals
  confirmed = output<void>();
  cancelled = output<void>();

  readonly lucideAlertTriangleIcon = lucideBadgeAlert;

  readonly lucideCheckIcon = lucideCheck;

  readonly lucideXIcon = lucideX;

  //Confirmation method
  confirm(): void {
    if (this.loading()) {
      return;
    }

    this.confirmed.emit();
  }

  //Cancel action method
  cancel(): void {
    if (this.loading()) {
      return;
    }

    this.cancelled.emit();
  }
}