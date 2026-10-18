import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RoleService } from '../../../features/roles/services/role.service';
import { PermissionService } from '../../../features/permissions/services/permission.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { Permission } from '../../../features/permissions/models/permission.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CreateRoleRequest } from '../../../features/roles/models/request/create-role-request.model';
import { CustomButton } from '../../common/custom-button/custom-button';
import { PermissionSelectorComponent } from '../permission-selector-component/permission-selector-component';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomCard } from '../../common/custom-card/custom-card';
import { NgIcon } from '@ng-icons/core';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { lucideArrowLeft, lucideSave, lucideShield, lucideShieldCheck } from '@ng-icons/lucide';
import { CustomTextarea } from '../../common/custom-text-area/custom-text-area';
import { PermissionCatalog } from '../../../features/permissions/models/permission-catalog.model';
import { toFilterOptions } from '../../../features/permissions/constants/permission-filters';

@Component({
  selector: 'app-create-role-component',
  standalone: true,
  imports: [ReactiveFormsModule, NgIcon, CustomButton, PermissionSelectorComponent, CustomDropdown, CustomCard, CustomTextfield, CustomTextarea],
  templateUrl: './create-role-component.html',
  styleUrl: './create-role-component.css',
})
/*Principal create role component */
export class CreateRoleComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly permissions = signal<Permission[]>([]);
  readonly selectedPermissions = signal<Permission[]>([]);

  // Add these:
  readonly catalog = signal<PermissionCatalog>({ modules: [], actions: [] });

  readonly permissionModules = computed(() => toFilterOptions(this.catalog().modules));
  readonly permissionActions = computed(() => toFilterOptions(this.catalog().actions));

  readonly selectedModule = signal('');
  readonly selectedAction = signal('');

  readonly moduleFilterControl = new FormControl('', {
    nonNullable: true
  });

  readonly actionFilterControl = new FormControl('', {
    nonNullable: true
  });

  //Icons
  readonly lucideSaveIcon = lucideSave;
  readonly lucideShieldCheckIcon = lucideShieldCheck;
  readonly lucideShieldIcon = lucideShield;
  readonly lucideArrowLeftIcon = lucideArrowLeft;

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

  readonly filteredPermissions = computed(() => {

    const module = this.selectedModule();
    const action = this.selectedAction();

    return this.permissions().filter(permission => {

      const matchesModule =
        !module || permission.module === module;

      const matchesAction =
        !action || permission.action === action;

      return matchesModule && matchesAction;
    });
  });

  readonly filteredActions = computed(() => {

    const module = this.selectedModule();

    if (!module) {
      return this.permissionActions();
    }

    const actions = new Set(
      this.permissions()
        .filter(permission => permission.module === module)
        .map(permission => permission.action)
    );

    return this.permissionActions().filter(
      action => !action.value || actions.has(action.value)
    );
  });

  ngOnInit(): void {
    this.loadPermissions();

    this.moduleFilterControl.valueChanges.subscribe(value => {
      this.selectedModule.set(value);
      this.actionFilterControl.setValue('');
    });

    this.actionFilterControl.valueChanges.subscribe(value => {
      this.selectedAction.set(value);
    });
  }

  loadPermissions(): void {
    this.loading.set(true);

    forkJoin({
      permissions: this.permissionService.getPermissions({
        page: 0,
        size: 50,
        sortBy: 'module',
        direction: 'asc'
      }),
      catalog: this.permissionService.getCatalog()
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: ({ permissions, catalog }) => {
        this.permissions.set(permissions.content);
        this.catalog.set(catalog);
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cargar los permisos.',
          'Error al cargar permisos'
        );
      }
    });
  }

  selectPermission(permission: Permission): void {
    this.selectedPermissions.update(
      permissions => [...permissions, permission]
    );
  }

  removePermission(permission: Permission): void {
    this.selectedPermissions.update(
      permissions =>
        permissions.filter(
          selected => selected.code !== permission.code
        )
    );
  }

  createRole(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const request: CreateRoleRequest = {
      alias: this.form.controls.alias.value,
      name: this.form.controls.name.value,
      description: this.form.controls.description.value,
      permissionIds: this.selectedPermissions().map(
        permission => permission.code
      )
    };

    this.roleService.createRole(request).pipe(
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: () => {
        this.toastService.success(
          'El rol fue creado correctamente.',
          'Rol creado'
        );

        this.goBack();
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible crear el rol.',
          'Error al crear rol'
        );
      }
    });
  }

  goBack(): void {
    this.router.navigate([
      '/dashboard/administration/roles'
    ]);
  }
}