import { Component, computed, inject, signal } from '@angular/core';
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
import { lucideActivity, lucideArrowLeft, lucideCalendarClock, lucideCalendarPlus, lucideCalendarX, lucideClipboardList, lucideHistory, lucideInfo, lucideKeyRound, lucideSave, lucideShield, lucideShieldCheck } from '@ng-icons/lucide';
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

  // Path param
  readonly roleId = this.route.snapshot.paramMap.get('id') ?? '';

  //Signals
  readonly loading = signal(false);
  readonly saving = signal(false);

  // Informational role details
  readonly roleDetails = signal<RoleEdit | null>(null);

  readonly formattedCreatedAt = computed(() => {
    const date = this.roleDetails()?.createdAt;
    return date ? this.formatDate(date) : 'No disponible';
  });

  readonly formattedUpdatedAt = computed(() => {
    const date = this.roleDetails()?.updatedAt;
    return date ? this.formatDate(date) : 'No disponible';
  });

  readonly formattedDeactivatedAt = computed(() => {
    const date = this.roleDetails()?.deactivatedAt;
    return date ? this.formatDate(date) : 'No aplica';
  });

  private formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'No disponible';
    }

    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

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
  readonly lucideClipboardListIcon = lucideClipboardList;
  readonly lucideActivityIcon = lucideActivity;
  readonly lucideShieldCheckIcon = lucideShieldCheck;
  readonly lucideKeyRoundIcon = lucideKeyRound;
  readonly lucideCalendarClockIcon = lucideCalendarClock;
  readonly lucideCalendarPlusIcon = lucideCalendarPlus;
  readonly lucideHistoryIcon = lucideHistory;
  readonly lucideCalendarXIcon = lucideCalendarX;
  readonly lucideInfoIcon = lucideInfo;

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
          this.roleDetails.set(role);

          this.form.patchValue({
            alias: role.code,
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
