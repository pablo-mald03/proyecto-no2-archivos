import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../../features/users/service/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { lucideArrowLeft, lucideAtSign, lucideLock, lucideMail, lucideUser, lucideUserPlus, lucideX } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { Role } from '../../../features/roles/models/role.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterUserRequest } from '../../../features/users/models/request/register-user-request.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { finalize } from 'rxjs';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { passwordMatchValidator } from '../../../core/validators/password-match.validator';
import { RoleService } from '../../../features/roles/services/role.service';
import { RoleSelectorComponent } from '../../roles/role-selector-component/role-selector-component';

@Component({
  selector: 'app-create-user-component',
  imports: [ReactiveFormsModule, CustomButton, CustomTextfield, RoleSelectorComponent],
  templateUrl: './create-user-component.html',
  styleUrl: './create-user-component.css',
})
/*Create user component */
export class CreateUserComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Icons
  readonly lucideUserIcon = lucideUser;
  readonly lucideAtSignIcon = lucideAtSign;
  readonly lucideMailIcon = lucideMail;
  readonly lucideLockIcon = lucideLock;
  readonly lucideXIcon = lucideX;
  readonly lucideUserPlusIcon = lucideUserPlus;

  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // State
  readonly loading = signal(false);
  readonly rolesLoading = signal(false);
  readonly roles = signal<Role[]>([]);
  readonly selectedRoleCode = signal('');

  readonly selectedRoles = computed(() => {
    const roleCode = this.selectedRoleCode();

    return this.roles().filter(
      role => role.code === roleCode
    );
  });

  // Form
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
      validators: [Validators.required, Validators.email],
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        passwordMatchValidator('password'),
      ],
    }),
  });

  ngOnInit(): void {
    this.loadRoles();

    this.userForm.controls.password.valueChanges.subscribe(() => {
      this.userForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  loadRoles(): void {
    this.rolesLoading.set(true);

    this.roleService
      .getRoles({
        page: 0,
        size: 50,
        sortBy: 'name',
        direction: 'asc',
        isActive: true,
      })
      .pipe(
        finalize(() => this.rolesLoading.set(false)),
      )
      .subscribe({
        next: response => {
          this.roles.set(response.content);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar los roles.',
            'Error al cargar roles',
          );
        },
      });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (!this.selectedRoleCode()) {
      this.toastService.error(
        'Selecciona un rol para el usuario.',
        'Rol requerido',
      );
      return;
    }

    const formValue = this.userForm.getRawValue();

    const request: RegisterUserRequest = {
      username: formValue.username.trim(),
      email: formValue.email.trim(),
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      password: formValue.password,
      roleCode: this.selectedRoleCode(),
    };

    this.loading.set(true);

    this.userService
      .registerUser(request)
      .pipe(
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: response => {
          this.toastService.success(
            'El usuario fue creado correctamente.',
            `Usuario ${response.email} creado`,
          );

          this.router.navigate([
            '/dashboard/administration/users',
          ]);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible crear el usuario.',
            'Error al crear usuario',
          );
        },
      });
  }

  // Select a single role
  selectRole(role: Role): void {
    this.selectedRoleCode.set(role.code);
  }

  // Remove selected role
  removeRole(role: Role): void {
    if (this.selectedRoleCode() === role.code) {
      this.selectedRoleCode.set('');
    }
  }


  get controls() {
    return this.userForm.controls;
  }

  cancel(): void {
    this.router.navigate([
      '/dashboard/administration/users',
    ]);
  }
}
