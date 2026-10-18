import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../features/roles/services/role.service';
import { PermissionService } from '../../../features/permissions/services/permission.service';
import { ToastService } from '../../../core/services/toast.service';
import { Permission } from '../../../features/permissions/models/permission.model';
import { lucideArrowLeft, lucideSave, lucideShieldCheck } from '@ng-icons/lucide';
import { finalize, forkJoin } from 'rxjs';
import { RolePermissions } from '../../../features/roles/models/role-permissions';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CustomButton } from '../../common/custom-button/custom-button';
import { PermissionSelectorComponent } from '../permission-selector-component/permission-selector-component';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { FormControl } from '@angular/forms';
import { UpdateRolePermissionsRequest } from '../../../features/roles/models/request/update-role-permissions-request';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { PermissionCatalog } from '../../../features/permissions/models/permission-catalog.model';
import { toFilterOptions } from '../../../features/permissions/constants/permission-filters';

@Component({
  selector: 'app-role-permissions-component',
  standalone: true,

  imports: [NgIcon, CustomButton, PermissionSelectorComponent, CustomCard, CustomDropdown],
  templateUrl: './role-permissions-component.html',
  styleUrl: './role-permissions-component.css',
})
//Principal role permissions edit component
export class RolePermissionsComponent implements OnInit {

  //Dependencies
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly toastService = inject(ToastService);

  //Path param
  readonly roleId = Number(
    this.route.snapshot.paramMap.get('id')
  );

  //Signals
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly permissions = signal<Permission[]>([]);
  readonly selectedPermissions = signal<Permission[]>([]);

  //Permissions filters
  readonly catalog = signal<PermissionCatalog>({ modules: [], actions: [] });

  readonly permissionModules = computed(() => toFilterOptions(this.catalog().modules));
  readonly permissionActions = computed(() => toFilterOptions(this.catalog().actions));

  readonly selectedModule = signal('');
  readonly selectedAction = signal('');

  //Reactive states
  readonly moduleFilterControl = new FormControl('', {
    nonNullable: true
  });

  readonly actionFilterControl = new FormControl('', {
    nonNullable: true
  });

  readonly role = signal<{
    alias: string;
    name: string;
    description: string;
  } | null>(null);

  // Icons
  readonly lucideSaveIcon = lucideSave;
  readonly lucideShieldCheckIcon = lucideShieldCheck;
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  //Filter for permissions
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

  //Filter for actions
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

  //On init actions
  ngOnInit(): void {
    this.loadData();

    this.moduleFilterControl.valueChanges.subscribe(value => {
      this.selectedModule.set(value);
      this.actionFilterControl.setValue('');
    });

    this.actionFilterControl.valueChanges.subscribe(value => {
      this.selectedAction.set(value);
    });
  }

  //Load data method
  loadData(): void {
    this.loading.set(true);

    forkJoin({
      role: this.roleService.getRolePermissions(this.roleId),
      permissions: this.permissionService.getPermissions({
        page: 0,
        size: 50,
        sortBy: 'module',
        direction: 'ASC'
      }),
      catalog: this.permissionService.getCatalog()
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: ({ role, permissions, catalog }) => {
        this.role.set({
          alias: role.alias,
          name: role.name,
          description: role.description
        });

        this.selectedPermissions.set(role.permissions);
        this.permissions.set(permissions.permissions);
        this.catalog.set(catalog);
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cargar la información.',
          'Error al cargar permisos'
        );
      }
    });
  }

  //Select permission method
  selectPermission(permission: Permission): void {
    this.selectedPermissions.update(
      permissions => [...permissions, permission]
    );
  }

  //Remove permission method
  removePermission(permission: Permission): void {
    this.selectedPermissions.update(
      permissions =>
        permissions.filter(
          selected => selected.id !== permission.id
        )
    );
  }

  //Update permissions request
  updatePermissions(): void {
    this.saving.set(true);

    const request: UpdateRolePermissionsRequest = {
      permissionIds: this.selectedPermissions().map(
        permission => permission.id
      )
    };

    this.roleService.updateRolePermissions(
      this.roleId,
      request
    ).pipe(
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: () => {
        this.toastService.success(
          'Los permisos del rol fueron actualizados correctamente.',
          'Permisos actualizados'
        );

        this.goBack();
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible actualizar los permisos.',
          'Error al actualizar permisos'
        );
      }
    });
  }

  //Go back method
  goBack(): void {
    this.router.navigate([
      '/dashboard/administration/roles'
    ]);
  }
}