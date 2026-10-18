import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { Router } from '@angular/router';
import { AuthState } from '../../../stores/auth.state';
import { ToastService } from '../../../core/services/toast.service';
import { RoleService } from '../../../features/roles/services/role.service';
import { lucidePlus } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { RolePage } from '../../../features/roles/models/pagination/role-pagination.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { Role } from '../../../features/roles/models/role.model';
import { RoleCard } from '../../roles/role-card/role-card';
import { CustomConfirmDialog } from '../../common/custom-confirm-dialog/custom-confirm-dialog';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CustomButton, CustomAlert, CustomInfiniteScroll, RoleCard, CustomConfirmDialog],
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.css',
})
/*Principal roles page */
export class RolesPage implements OnInit {

  //Attributes
  private readonly router = inject(Router);

  //Services
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);

  //Permissions
  readonly canCreate = computed(() =>
    this.authState.hasPermission('ROLES_CREATE')
  );

  readonly canEdit = computed(() =>
    this.authState.hasPermission('ROLES_UPDATE')
  );

  readonly canChangeStatus = computed(() =>
    this.authState.hasPermission('ROLES_DELETE')
  );

  readonly canAssignPermissions = computed(() =>
    this.authState.hasPermission('ROLES_PERMISSIONS_UPDATE')
  );

  //Dialog props
  readonly statusDialogOpen = signal(false);
  readonly statusDialogLoading = signal(false);
  readonly selectedRole = signal<Role | null>(null);

  readonly statusDialogAction = computed(() => {
    const role = this.selectedRole();

    return role?.isActive
      ? 'desactivar'
      : 'activar';
  });

  readonly statusDialogTitle = computed(() => {
    const role = this.selectedRole();

    return role?.isActive
      ? '¿Desactivar rol?'
      : '¿Activar rol?';
  });

  readonly statusDialogMessage = computed(() => {
    const role = this.selectedRole();

    if (!role) {
      return '';
    }

    return role.isActive
      ? `El rol '${role.name}' dejará de estar disponible para asignación.`
      : `El rol '${role.name}' volverá a estar disponible para asignación.`;
  });


  //Signals
  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly hasMore = signal(true);
  readonly page = signal(0);
  readonly initialized = signal(false);

  readonly size = 12;

  //Icons
  readonly lucidePlusIcon = lucidePlus;

  //On init actions
  ngOnInit(): void {
    this.loadMore();
  }

  //Load roles
  loadMore(): void {
    if (this.loading() || !this.hasMore()) {
      return;
    }

    this.loading.set(true);

    this.roleService.getRoles({
      page: this.page(),
      size: this.size,
      sortBy: 'name',
      direction: 'asc'
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response: RolePage) => {
        this.roles.update(
          roles => [
            ...roles,
            ...response.content
          ]
        );

        this.page.update(
          page => page + 1
        );

        this.hasMore.set(
          this.page() < response.totalPages
        );

        this.initialized.set(true);
      },
      error: (error: ErrorResponse) => {
        this.initialized.set(true);

        this.toastService.error(
          error.message || 'No fue posible cargar los roles.',
          'Error al cargar roles'
        );
      }
    });
  }

  //Create role
  createRole(): void {
    this.router.navigate([
      '/dashboard/administration/roles/create'
    ]);
  }

  //Edit role
  editRole(role: Role): void {
    this.router.navigate([
      '/dashboard/administration/roles',
      role.id,
      'edit'
    ]);
  }

  //Assign permissions
  assignPermissions(role: Role): void {
    this.router.navigate([
      '/dashboard/administration/roles',
      role.id,
      'permissions'
    ]);
  }

  //Toggle status method
  toggleRoleStatus(role: Role): void {
    this.selectedRole.set(role);
    this.statusDialogOpen.set(true);
  }

  //Confirm the change status method
  confirmRoleStatus(): void {
    const role = this.selectedRole();

    if (!role) {
      return;
    }

    const newStatus = !role.isActive;

    this.statusDialogLoading.set(true);

    this.roleService.changeStatus(role.id, newStatus)
      .pipe(
        finalize(() => {
          this.statusDialogLoading.set(false);
          this.closeStatusDialog();
        })
      )
      .subscribe({
        next: () => {
          this.roles.update(roles =>
            roles.map(current =>
              current.id === role.id
                ? { ...current, isActive: newStatus }
                : current
            )
          );

          this.toastService.success(
            `El rol fue ${newStatus ? 'activado' : 'desactivado'} correctamente.`,
            newStatus ? 'Rol activado' : 'Rol desactivado'
          );
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cambiar el estado del rol.',
            'Error al cambiar estado'
          );
        }
      });
  }

  //Close dialog method
  closeStatusDialog(): void {
    if (this.statusDialogLoading()) {
      return;
    }

    this.statusDialogOpen.set(false);
    this.selectedRole.set(null);
  }
}