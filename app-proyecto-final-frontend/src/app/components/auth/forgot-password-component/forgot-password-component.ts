import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { provideIcons } from '@ng-icons/core';
import { lucideIdCard, lucideLock, lucideMail } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { finalize } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../features/users/service/user.service';

@Component({
  selector: 'app-forgot-password-component',
  imports: [
    ReactiveFormsModule,
    CustomButton,
    CustomTextfield
  ],
  providers: [
    provideIcons({
      lucideMail,
      lucideIdCard,
      lucideLock
    })
  ],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.css',
})
/**
 * Component to delegate the forgot password component
*/
export class ForgotPasswordComponent {

  //Dependency inversion for the auth service
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);

  readonly lucideMailIcon = lucideMail;
  readonly lucideIdCardIcon = lucideIdCard;
  readonly lucideLockIcon = lucideLock;

  //FORM GROUP PROPS
  readonly loginForm = new FormGroup({
    username: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    newPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)]
    })
  });

  //Constructor for router
  constructor(
    private readonly router: Router
  ) { }

  //Get the controls from the form
  get controls() {
    return this.loginForm.controls;
  }

  //Method to submit the post
  recoverPassword(): void {

    const {
      username,
      email,
      newPassword,
      confirmPassword
    } = this.loginForm.value;


    if (newPassword !== confirmPassword) {

      this.controls.confirmPassword.setErrors({
        passwordMismatch: true
      });

      this.loginForm.markAllAsTouched();

      return;
    }


    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }


    this.loading.set(true);


    const request = {
      username: username!,
      email: email!,
      password: newPassword!,
      confirmationPassword: confirmPassword!
    };


    this.userService.recoverPassword(request)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({

        next: () => {

          this.toastService.success('Contraseña reestrablecida', 'Recuperacion de contraseña exitosa');
          this.router.navigate([
            '/auth/login'
          ]);

        },


        error: (error: ErrorResponse) => {

          this.toastService.error(
            error.message || 'Credenciales inválidas',
            'Error de recuperacion'
          );

        }

      });

  }

  //Method to return to the login page
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

}
