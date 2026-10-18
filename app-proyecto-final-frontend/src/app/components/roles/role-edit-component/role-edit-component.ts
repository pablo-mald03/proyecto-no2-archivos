import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { finalize } from 'rxjs';
import { UpdateRoleRequest } from '../../../features/roles/models/request/update-role.model';
import { RoleEdit } from '../../../features/roles/models/role-edit.model';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../features/roles/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { lucideArrowLeft, lucideSave, lucideShield } from '@ng-icons/lucide';
import { CustomTextarea } from '../../common/custom-text-area/custom-text-area';

@Component({
  selector: 'app-role-edit-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    CustomButton,
    CustomCard,
    CustomTextfield,
    CustomTextarea
],
  templateUrl: './role-edit-component.html',
  styleUrl: './role-edit-component.css',
})
/*Principal role edit component */
export class RoleEditComponent {

  //Dependencies
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);

  //role id path param
  readonly roleId = Number(
    this.route.snapshot.paramMap.get('id')
  );

  //Signals
  readonly loading = signal(false);
  readonly saving = signal(false);

  //Form
  readonly form = new FormGroup({
    alias: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(50)
      ]
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(50)
      ]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(120)
      ]
    })
  });

  // Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;
  readonly lucideSaveIcon = lucideSave;
  readonly lucideShieldIcon = lucideShield;

  //Method to load the role on init
  ngOnInit(): void {
    this.loadRole();
  }

  //Method to load the role information
  loadRole(): void {
    this.loading.set(true);

    this.roleService.getRoleById(this.roleId)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (role: RoleEdit) => {
          this.form.patchValue({
            alias: role.alias,
            name: role.name,
            description: role.description
          });
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar la información del rol.',
            'Error al cargar rol'
          );
        }
      });
  }

  //Update role request
  updateRole(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const request: UpdateRoleRequest = {
      alias: this.form.controls.alias.value,
      name: this.form.controls.name.value,
      description: this.form.controls.description.value
    };

    this.roleService.updateRole(this.roleId, request).pipe(
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: () => {
        this.toastService.success(
          'El rol fue actualizado correctamente.',
          'Rol actualizado'
        );

        this.goBack();
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible actualizar el rol.',
          'Error al actualizar rol'
        );
      }
    });
  }

  //Principal go back method
  goBack(): void {
    this.router.navigate([
      '/dashboard/administration/roles'
    ]);
  }
}
