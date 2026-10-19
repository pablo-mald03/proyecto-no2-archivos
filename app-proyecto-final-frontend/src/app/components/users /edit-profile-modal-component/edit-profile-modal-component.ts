import { Component, inject, input, output, signal } from '@angular/core';
import { UserService } from '../../../features/users/service/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserProfile } from '../../../features/users/models/response/user-profile.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { finalize } from 'rxjs';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { AuthState } from '../../../stores/auth.state';

@Component({
  selector: 'app-edit-profile-modal-component',
  imports: [CustomButton, CustomTextfield, CustomModalComponent, ReactiveFormsModule],
  templateUrl: './edit-profile-modal-component.html',
  styleUrl: './edit-profile-modal-component.css',
})
//Edit profile data modal component
export class EditProfileModalComponent {

  // Dependencies injection
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);

  // Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly profile = input<UserProfile | null>(null);

  readonly closed = output<void>();
  readonly updated = output<void>();

  // Reactive signals
  readonly saving = signal(false);

  // Form group including all fields required by updateUser endpoint
  readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)]
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)]
    })
  });

  get controls() {
    return this.form.controls;
  }

  // Populate form controls when modal opens using profile data
  ngOnChanges(): void {
    const currentProfile = this.profile();
    if (this.isOpen() && currentProfile) {
      this.form.patchValue({
        username: currentProfile.username,
        email: currentProfile.email,
        firstName: currentProfile.firstName,
        lastName: currentProfile.lastName
      });
    }
  }

  // Submit profile update 
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();

    this.userService.updateSelfProfile(payload)
      .pipe(
        finalize(() => {
          this.saving.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'La información de tu perfil ha sido actualizada exitosamente.',
            'Perfil Actualizado'
          );
          this.updated.emit();
          this.closeModal();
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible actualizar la información del perfil.',
            'Error al Actualizar'
          );
        }
      });
  }

  // Close modal and reset form
  closeModal(): void {
    this.form.reset();
    this.closed.emit();
  }
}