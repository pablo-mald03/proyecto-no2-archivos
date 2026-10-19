import { Component, inject, input, output, signal } from '@angular/core';
import { UserService } from '../../../features/users/service/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomButton } from '../../common/custom-button/custom-button';
import { ChangeSelfPasswordRequest } from '../../../features/users/models/request/change-self-password-request.model';

@Component({
  selector: 'app-change-password-modal-component',
  imports: [CustomModalComponent, CustomTextfield, CustomButton, ReactiveFormsModule],
  templateUrl: './change-password-modal-component.html',
  styleUrl: './change-password-modal-component.css',
})
export class ChangePasswordModalComponent {
  // Dependencies injection
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  // Inputs & Outputs for parent-child communication
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly updated = output<void>();

  // Reactive signals
  readonly saving = signal(false);

  // Form group definition for password change
  readonly form = new FormGroup({
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    })
  });

  get controls() {
    return this.form.controls;
  }

  // Handle form submission and backend request
  onSubmit(): void {
    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this.controls.confirmPassword.setErrors({ passwordMismatch: true });
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    // Payload matching the exact endpoint requirements (including confirmationPassword)
    const payload: ChangeSelfPasswordRequest = {
      currentPassword,
      newPassword,
      confirmationPassword: confirmPassword
    };

    this.userService.changeSelfPassword(payload)
      .pipe(
        finalize(() => {
          this.saving.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'Tu contraseña fue cambiada correctamente.',
            'Contraseña cambiada'
          );
          this.updated.emit();
          this.closeModal();
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No se ha podido cambiar la contraseña. Verifica tus credenciales.',
            'Error de seguridad'
          );
        }
      });
  }

  // Reset form state and notify parent component to close modal
  closeModal(): void {
    this.form.reset();
    this.closed.emit();
  }
}