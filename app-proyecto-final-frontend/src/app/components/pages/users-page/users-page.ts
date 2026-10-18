import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { User } from '../../../features/users/models/user.model';
import { lucideArrowUpDown, lucideChevronDown, lucideFilter, lucidePlus, lucideRotateCcw, lucideSearch, lucideSlidersHorizontal } from '@ng-icons/lucide';
import { UserService } from '../../../features/users/services/user.service';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { AuthState } from '../../../stores/auth.state';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs';
import { CustomConfirmDialog } from '../../common/custom-confirm-dialog/custom-confirm-dialog';
import { UserCard } from '../../users /user-card/user-card';
import { FormControl } from '@angular/forms';
import { UserQuery } from '../../../features/users/models/query/user-query.model';
import { RoleService } from '../../../features/roles/services/role.service';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomCard } from '../../common/custom-card/custom-card';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    UserCard,
    CustomButton,
    CustomInfiniteScroll,
    CustomAlert,
    CustomConfirmDialog,
    CustomTextfield,
    CustomDropdown,
    CustomCard,
    NgIconComponent
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
  private readonly roleService = inject(RoleService);

  // Status dialog state
  readonly statusDialogOpen = signal(false);
  readonly statusDialogLoading = signal(false);
  readonly selectedUser = signal<User | null>(null);

  readonly filtersExpanded = signal(false);

  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;

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
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideFilterIcon = lucideFilter;
  readonly lucideArrowUpDownIcon = lucideArrowUpDown;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucidePlusIcon = lucidePlus;

  // Filter controls
  readonly searchControl = new FormControl('', {
    nonNullable: true
  });

  readonly statusControl = new FormControl('', {
    nonNullable: true
  });

  readonly roleControl = new FormControl('', {
    nonNullable: true
  });

  readonly sortControl = new FormControl('createdAt', {
    nonNullable: true
  });

  readonly directionControl = new FormControl('desc', {
    nonNullable: true
  });

  // Filter options
  readonly statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' }
  ];

  readonly sortOptions = [
    { label: 'Fecha de creación', value: 'createdAt' },
    { label: 'Último acceso', value: 'lastLoginAt' },
    { label: 'Nombre de usuario', value: 'username' },
    { label: 'Correo electrónico', value: 'email' },
    { label: 'Nombre', value: 'firstName' },
    { label: 'Apellido', value: 'lastName' }
  ];

  readonly directionOptions = [
    { label: 'Descendente', value: 'desc' },
    { label: 'Ascendente', value: 'asc' }
  ];

  // Roles for filtering
  readonly roleOptions = signal([
    { label: 'Todos los roles', value: '' }
  ]);



  // Request tracking to ignore outdated responses
  private requestVersion = 0;

  ngOnInit(): void {
    this.loadRoleOptions();

    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value)
      ),
      this.statusControl.valueChanges.pipe(
        startWith(this.statusControl.value)
      ),
      this.roleControl.valueChanges.pipe(
        startWith(this.roleControl.value)
      ),
      this.sortControl.valueChanges.pipe(
        startWith(this.sortControl.value)
      ),
      this.directionControl.valueChanges.pipe(
        startWith(this.directionControl.value)
      )
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged((previous, current) =>
        previous.every((value, index) => value === current[index])
      )
    ).subscribe(() => {
      this.resetAndLoad();
    });
  }

  private resetAndLoad(): void {
    // Invalidate requests using previous filters.
    this.requestVersion++;

    this.users.set([]);
    this.page.set(0);
    this.hasMore.set(true);
    this.loading.set(false);
    this.initialized.set(false);

    this.loadMore();
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) {
      return;
    }

    this.loading.set(true);

    const version = this.requestVersion;

    this.userService.getUsers({
      page: this.page(),
      size: this.size,
      search: this.searchControl.value.trim() || undefined,
      isActive: this.statusControl.value === ''
        ? undefined
        : this.statusControl.value === 'true',
      roleCode: this.roleControl.value || undefined,
      sortBy: this.sortControl.value as UserQuery['sortBy'],
      direction: this.directionControl.value as 'asc' | 'desc'
    }).pipe(
      finalize(() => {
        if (version === this.requestVersion) {
          this.loading.set(false);
          this.initialized.set(true);
        }
      })
    ).subscribe({
      next: response => {
        if (version !== this.requestVersion) {
          return;
        }

        this.users.update(current => [
          ...current,
          ...response.content
        ]);

        this.page.set(response.page + 1);
        this.hasMore.set(this.page() < response.totalPages);
      },

      error: (error: ErrorResponse) => {
        if (version !== this.requestVersion) {
          return;
        }

        this.toastService.error(
          error.message || 'No fue posible cargar los usuarios.',
          'Error al cargar usuarios'
        );
      }
    });
  }

  private loadRoleOptions(): void {
    this.roleService.getRoles({
      page: 0,
      size: 100,
      sortBy: 'name',
      direction: 'asc'
    }).subscribe({
      next: response => {
        this.roleOptions.set([
          { label: 'Todos los roles', value: '' },
          ...response.content.map(role => ({
            label: role.name,
            value: role.code
          }))
        ]);
      },
      error: () => {
        this.toastService.error(
          'No fue posible cargar los roles para los filtros.',
          'Error al cargar roles'
        );
      }
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

  resetFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
    this.roleControl.setValue('');
    this.sortControl.setValue('createdAt');
    this.directionControl.setValue('desc');
  }
}
