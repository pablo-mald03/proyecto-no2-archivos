import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { User } from '../../../features/users/models/user.model';
import { lucidePlus } from '@ng-icons/lucide';
import { UserService } from '../../../features/users/services/user.service';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { AuthState } from '../../../stores/auth.state';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CustomConfirmDialog } from '../../common/custom-confirm-dialog/custom-confirm-dialog';
import { UserCard } from '../../users /user-card/user-card';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    UserCard,
    CustomButton,
    CustomInfiniteScroll,
    CustomAlert,
    CustomConfirmDialog
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
/*Principal users page layout to show all the users */
export class UsersPage implements OnInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);

  // Status dialog state
  readonly statusDialogOpen = signal(false);
  readonly statusDialogLoading = signal(false);
  readonly selectedUser = signal<User | null>(null);

  readonly statusDialogAction = computed(() =>
    this.selectedUser()?.isActive ? 'desactivar' : 'activar'
  );

  readonly statusDialogTitle = computed(() =>
    this.selectedUser()?.isActive
      ? '¿Desactivar usuario?'
      : '¿Activar usuario?'
  );

  readonly statusDialogMessage = computed(() => {
    const user = this.selectedUser();

    if (!user) {
      return '';
    }

    return user.isActive
      ? `El usuario ${user.username} dejará de tener acceso al sistema.`
      : `El usuario ${user.username} volverá a tener acceso al sistema.`;
  });

  // RBAC permissions
  readonly canCreate = computed(() =>
    this.authState.hasPermission('USERS_CREATE')
  );

  readonly canEdit = computed(() =>
    this.authState.hasPermission('USERS_UPDATE')
  );

  readonly canChangeStatus = computed(() =>
    this.authState.hasPermission('USERS_CHANGE_STATUS')
  );

  // Users pagination state
  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly hasMore = signal(true);
  readonly page = signal(0);
  readonly initialized = signal(false);

  readonly size = 8;

  // Icons
  readonly lucidePlusIcon = lucidePlus;

  ngOnInit(): void {
    this.loadMore();
  }

  /* Load more users */
  loadMore(): void {
    if (this.loading() || !this.hasMore()) {
      return;
    }

    this.loading.set(true);

    this.userService.getUsers({
      page: this.page(),
      size: this.size,
      sortBy: 'createdAt',
      direction: 'asc',
    }).pipe(
      finalize(() => {
        this.loading.set(false);
        this.initialized.set(true);
      }),
    ).subscribe({
      next: response => {
        this.users.update(currentUsers => [
          ...currentUsers,
          ...response.content,
        ]);

        this.page.update(currentPage => currentPage + 1);
        this.hasMore.set(this.page() < response.totalPages);
      },

      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cargar los usuarios.',
          'Error al cargar usuarios',
        );
      },
    });
  }

  /* Navigate to create user */
  createUser(): void {
    this.router.navigate([
      '/dashboard/administration/users/create',
    ]);
  }

  /* Navigate to edit user */
  editUser(user: User): void {
    this.router.navigate([
      '/dashboard/administration/users',
      user.id,
      'edit',
    ]);
  }

  /* Open status confirmation dialog */
  toggleUserStatus(user: User): void {
    this.selectedUser.set(user);
    this.statusDialogOpen.set(true);
  }

  /* Confirm user status change */
  confirmUserStatus(): void {
    const user = this.selectedUser();

    if (!user || this.statusDialogLoading()) {
      return;
    }

    const nextStatus = !user.isActive;

    this.statusDialogLoading.set(true);

    this.userService.changeStatus(user.id, nextStatus).pipe(
      finalize(() => {
        this.statusDialogLoading.set(false);
        this.closeStatusDialog();
      }),
    ).subscribe({
      next: () => {
        this.users.update(currentUsers =>
          currentUsers.map(current =>
            current.id === user.id
              ? { ...current, isActive: nextStatus }
              : current
          )
        );

        this.toastService.success(
          `El usuario fue ${nextStatus ? 'activado' : 'desactivado'} correctamente.`,
          nextStatus ? 'Usuario activado' : 'Usuario desactivado',
        );
      },

      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cambiar el estado del usuario.',
          'Error al cambiar estado',
        );
      },
    });
  }

  /* Close confirmation dialog */
  closeStatusDialog(): void {
    if (this.statusDialogLoading()) {
      return;
    }

    this.statusDialogOpen.set(false);
    this.selectedUser.set(null);
  }
}
