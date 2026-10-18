import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../features/users/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { lucideArrowLeft, lucideSave, lucideUserRound } from '@ng-icons/lucide';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { phoneValidator } from '../../../core/validators/phone.validator';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { UpdateUserRequest } from '../../../features/users/models/request/update-user-request.model';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { User } from '../../../features/users/models/user.model';

@Component({
  selector: 'app-profile-user-edit-component',
  imports: [
    NgIcon,
    ReactiveFormsModule,
    CustomButton,
    CustomTextfield,
    CustomCard,
  ],
  templateUrl: './profile-user-edit-component.html',
  styleUrl: './profile-user-edit-component.css',
})
/*Principal profile edit user component */
export class ProfileUserEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly userId = this.route.snapshot.paramMap.get('id')!;

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly lucideArrowLeftIcon = lucideArrowLeft;
  readonly lucideSaveIcon = lucideSave;
  readonly lucideUserIcon = lucideUserRound;

  readonly userForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
      ],
    }),

    firstName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
      ],
    }),

    lastName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
      ],
    }),
  });

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading.set(true);

    this.userService.getUserById(this.userId).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (user: User) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      },

      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cargar la información del usuario.',
          'Error al cargar usuario',
        );

        this.goBack();
      },
    });
  }

  updateUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();

    const request: UpdateUserRequest = {
      username: formValue.username.trim(),
      email: formValue.email.trim(),
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
    };

    this.saving.set(true);

    this.userService.updateUser(this.userId, request).pipe(
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        this.toastService.success(
          'La información del usuario fue actualizada correctamente.',
          'Usuario actualizado',
        );

        this.goBack();
      },

      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible actualizar el usuario.',
          'Error al actualizar usuario',
        );
      },
    });
  }

  goBack(): void {
    this.router.navigate([
      '/dashboard/administration/users',
      this.userId,
      'edit',
    ]);
  }

  get controls() {
    return this.userForm.controls;
  }
}