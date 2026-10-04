import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideLock, lucideMail } from '@ng-icons/lucide';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { finalize } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { homeFor } from '../../../core/utils/role-home';

@Component({
  selector: 'app-login-component',
  imports: [
    ReactiveFormsModule,
    CustomButton,
    CustomTextfield
  ],
  providers: [
    provideIcons({
      lucideMail,
      lucideLock
    })
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
/*Login component */
export class LoginComponent {

  //Dependency inversion for the auth service
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);

  readonly lucideMailIcon = lucideMail;
  readonly lucideLockIcon = lucideLock;

  /**
   * FORM ATTRIBUTES SECTION
   * 
  */
  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      validators: [Validators.required]
    })
  });

  /*CONSTRUCTOR FOR THE ROUTER DEPENDENCIES*/

  constructor(
    private readonly router: Router
  ) { }


  //LOGIN SUBMIT METHOD
  login(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const request = {
      email: this.loginForm.controls.email.value!,
      password: this.loginForm.controls.password.value!
    };


    this.authService.login(request)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (user) => {
          this.toastService.success('Bienvenido de nuevo', 'Acceso exitoso');
          this.router.navigate([homeFor(user.roleCode)]);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(error.message || 'Credenciales inválidas', 'Error de autenticación');
        }
      });


  }

  //Get the controls from the form
  get controls() {
    return this.loginForm.controls;
  }

  /*Method to redirect to the forgot password view*/
  goToForgotPassword(): void {

    this.router.navigate([
      '/auth/forgot-password'
    ]);

  }

  //Method to redirect to the register form
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }


}
