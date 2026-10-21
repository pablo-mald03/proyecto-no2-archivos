import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../../features/users/service/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { lucideLock, lucideMail, lucideUser, lucideUserCheck } from '@ng-icons/lucide';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterUserSelfRequest } from '../../../features/users/models/request/register-user-self.request';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';

@Component({
  selector: 'app-register-user-component',
  imports: [CustomButton, CustomTextfield, ReactiveFormsModule],
  templateUrl: './register-user-component.html',
  styleUrl: './register-user-component.css',
})
export class RegisterUserComponent {

  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);

  // Lucide Icons
  readonly lucideUserIcon = lucideUser;
  readonly lucideMailIcon = lucideMail;
  readonly lucideLockIcon = lucideLock;
  readonly lucideUserCheckIcon = lucideUserCheck;

  // Form Group
  readonly registerForm = new FormGroup({
    username: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    firstName: new FormControl('', {
      validators: [Validators.required]
    }),
    lastName: new FormControl('', {
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)]
    })
  });

  get controls() {
    return this.registerForm.controls;
  }

  // Method to submit self-registration
  register(): void {
    const {
      username,
      email,
      firstName,
      lastName,
      password,
      confirmPassword
    } = this.registerForm.value;

    // Confirm passwords match
    if (password !== confirmPassword) {
      this.controls.confirmPassword.setErrors({ passwordMismatch: true });
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const request: RegisterUserSelfRequest = {
      username: username!.trim(),
      email: email!.trim(),
      firstName: firstName!.trim(),
      lastName: lastName!.trim(),
      password: password!
    };

    this.userService.registerSelf(request)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'Tu cuenta se ha creado exitosamente.',
            'Registro completado'
          );
          this.router.navigate(['/auth/login']);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible completar el registro.',
            'Error al registrarte'
          );
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}