import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RoleService } from '../../../features/roles/services/role.service';
import { PermissionService } from '../../../features/permissions/services/permission.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { Permission } from '../../../features/permissions/models/permission.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { combineLatest, EMPTY } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  startWith,
  switchMap
} from 'rxjs/operators';
import { sanitizeCode } from '../../../core/utils/string.util';

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

  // Signals
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly permissions = signal<Permission[]>([]);
  readonly selectedPermissions = signal<Permission[]>([]);

  // Permissions catalog and filters
  readonly catalog = signal<PermissionCatalog>({
    modules: []
  });

  readonly permissionModules = computed(() =>
    toFilterOptions(this.catalog().modules)
  );

  readonly moduleFilterControl = new FormControl('', {
    nonNullable: true
  });

  readonly searchFilterControl = new FormControl('', {
    nonNullable: true
  });

  // Icons
  readonly lucideSaveIcon = lucideSave;
  readonly lucideShieldCheckIcon = lucideShieldCheck;
  readonly lucideShieldIcon = lucideShield;
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Role form
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

  // Initialize filters and load data
  ngOnInit(): void {
    this.loadCatalog();

    combineLatest([
      this.moduleFilterControl.valueChanges.pipe(
        startWith(this.moduleFilterControl.value)
      ),
      this.searchFilterControl.valueChanges.pipe(
        startWith(this.searchFilterControl.value)
      )
    ]).pipe(
      debounceTime(300),

      distinctUntilChanged(
        ([previousModule, previousSearch], [module, search]) =>
          previousModule === module &&
          previousSearch === search
      ),

      switchMap(([module, search]) => {
        this.loading.set(true);

        return this.permissionService.getPermissions({
          page: 0,
          size: 50,
          sortBy: 'module',
          direction: 'asc',
          module: module || undefined,
          search: search.trim() || undefined
        }).pipe(
          finalize(() => this.loading.set(false)),
          catchError((error: ErrorResponse) => {
            this.toastService.error(
              error.message || 'No fue posible cargar los permisos.',
              'Error al cargar permisos'
            );

            return EMPTY;
          })
        );
      })
    ).subscribe(page => {
      this.permissions.set(page.content);
    });
  }

  // Load available modules
  loadCatalog(): void {
    this.permissionService.getCatalog().subscribe({
      next: catalog => {
        this.catalog.set(catalog);
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cargar los módulos.',
          'Error al cargar módulos'
        );
      }
    });
  }

  // Select permission
  selectPermission(permission: Permission): void {
    this.selectedPermissions.update(permissions => {
      if (permissions.some(selected => selected.code === permission.code)) {
        return permissions;
      }

      return [...permissions, permission];
    });
  }

  // Remove permission
  removePermission(permission: Permission): void {
    this.selectedPermissions.update(
      permissions =>
        permissions.filter(
          selected => selected.code !== permission.code
        )
    );
  }


  // Create role request
  createRole(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const request: CreateRoleRequest = {
      code: sanitizeCode(this.form.controls.alias.value), 
      name: this.form.controls.name.value,
      description: this.form.controls.description.value,
      permissions: this.selectedPermissions().map(
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

  // Go back
  goBack(): void {
    this.router.navigate([
      '/dashboard/administration/roles'
    ]);
  }
}