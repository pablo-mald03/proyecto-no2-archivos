import { Component, inject, OnInit, signal } from '@angular/core';
import { PermissionService } from '../../../features/permissions/services/permission.service';
import { ToastService } from '../../../core/services/toast.service';
import { Permission } from '../../../features/permissions/models/permission.model';
import { PermissionPage } from '../../../features/permissions/models/permission-pagination.model';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { PermissionCard } from '../../permissions/permission-card/permission-card';

@Component({
  selector: 'app-permissions-page',
  imports: [CustomInfiniteScroll, CustomAlert, PermissionCard],
  templateUrl: './permissions-page.html',
  styleUrl: './permissions-page.css',
})
/*Principal permissions page */
export class PermissionsPage implements OnInit {

  //Services
  private readonly permissionService = inject(PermissionService);
  private readonly toastService = inject(ToastService);

  //Signals
  readonly permissions = signal<Permission[]>([]);
  readonly loading = signal(false);
  readonly hasMore = signal(true);
  readonly page = signal(0);
  readonly initialized = signal(false);

  readonly size = 18;

  //On init actions
  ngOnInit(): void {
    this.loadMore();
  }

  //Load permissions
  loadMore(): void {
    if (this.loading() || !this.hasMore()) {
      return;
    }

    this.loading.set(true);

    this.permissionService.getPermissions({
      page: this.page(),
      size: this.size,
      sortBy: 'module',
      direction: 'ASC'
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response: PermissionPage) => {
        this.permissions.update(
          permissions => [
            ...permissions,
            ...response.permissions
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
          error.message || 'No fue posible cargar los permisos.',
          'Error al cargar permisos'
        );
      }
    });
  }
}