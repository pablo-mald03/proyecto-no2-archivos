import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { ReportUsersTopFileCountWidget } from '../../report-widgets/report-users-top-file-count-widget/report-users-top-file-count-widget';
import { ReportUsersTopStorageWidget } from '../../report-widgets/report-users-top-storage-widget/report-users-top-storage-widget';
import { ReportSharesMostSharedWidget } from '../../report-widgets/report-shares-most-shared-widget/report-shares-most-shared-widget';
import { ReportFoldersMostFilesWidget } from '../../report-widgets/report-folders-most-files-widget/report-folders-most-files-widget';
import { AuthState } from '../../../stores/auth.state';
import { ReportUsersService } from '../../../features/report-users/service/report-users.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportSharesService } from '../../../features/report-shares/service/report-shares.service';
import { ReportFoldersService } from '../../../features/report-folders/service/report-folders.service';
import { TopUserByFileCountResponse } from '../../../features/report-users/models/response/top-user-by-file-count-response.model';
import { TopUserByStorageResponse } from '../../../features/report-users/models/response/top-user-by-storage-response.model';
import { MostSharedFileResponse } from '../../../features/report-shares/models/response/most-shared-file-response.model';
import { FolderWithMostFilesResponse } from '../../../features/report-folders/models/response/folder-with-most-files-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CustomAlert,
    ReportUsersTopFileCountWidget,
    ReportUsersTopStorageWidget,
    ReportSharesMostSharedWidget,
    ReportFoldersMostFilesWidget
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
/*Principal dashboard home page*/
export class DashboardHome implements OnInit {

  //Dependencies
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly toastService = inject(ToastService);
  private readonly reportUsersService = inject(ReportUsersService);
  private readonly reportSharesService = inject(ReportSharesService);
  private readonly reportFoldersService = inject(ReportFoldersService);

  //Preview limit
  readonly PREVIEW_LIMIT = 5;

  //Report routes
  private readonly ROUTE_TOP_FILE_COUNT = '/dashboard/reports/users/top-file-count';
  private readonly ROUTE_TOP_STORAGE = '/dashboard/reports/users/top-storage-used';
  private readonly ROUTE_MOST_SHARED = '/dashboard/reports/sharing/most-shared-files';
  private readonly ROUTE_TOP_FOLDERS = '/dashboard/reports/folders/top-files-per-folder';

  //Permissions
  readonly canSeeTopFileCount = computed(() =>
    this.authState.hasPermission('REPORTS_USERS_TOP_FILES')
  );

  readonly canSeeTopStorage = computed(() =>
    this.authState.hasPermission('REPORTS_USERS_TOP_STORAGE')
  );

  readonly canSeeMostShared = computed(() =>
    this.authState.hasPermission('REPORTS_SHARING_MOST_SHARED')
  );

  readonly canSeeTopFolders = computed(() =>
    this.authState.hasPermission('REPORTS_FOLDERS_TOP_FILES')
  );

  readonly canSeeAnyWidget = computed(() =>
    this.canSeeTopFileCount() ||
    this.canSeeTopStorage() ||
    this.canSeeMostShared() ||
    this.canSeeTopFolders()
  );

  //Top users by file count preview state
  readonly topFileCount = signal<TopUserByFileCountResponse[]>([]);
  readonly topFileCountLoading = signal(false);

  //Top users by storage preview state
  readonly topStorage = signal<TopUserByStorageResponse[]>([]);
  readonly topStorageLoading = signal(false);

  //Most shared files preview state
  readonly mostShared = signal<MostSharedFileResponse[]>([]);
  readonly mostSharedLoading = signal(false);

  //Folders with most files preview state
  readonly topFolders = signal<FolderWithMostFilesResponse[]>([]);
  readonly topFoldersLoading = signal(false);

  //On init
  ngOnInit(): void {
    if (this.canSeeTopFileCount()) {
      this.loadTopFileCountPreview();
    }

    if (this.canSeeTopStorage()) {
      this.loadTopStoragePreview();
    }

    if (this.canSeeMostShared()) {
      this.loadMostSharedPreview();
    }

    if (this.canSeeTopFolders()) {
      this.loadTopFoldersPreview();
    }
  }

  //Method to load top users by file count preview
  private loadTopFileCountPreview(): void {
    this.topFileCountLoading.set(true);

    this.reportUsersService.getTopByFileCount()
      .pipe(finalize(() => this.topFileCountLoading.set(false)))
      .subscribe({
        next: (response) => this.topFileCount.set(response ?? []),
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar el top de usuarios con más archivos.',
            'Error al cargar dashboard'
          );
        }
      });
  }

  //Method to load top users by storage preview
  private loadTopStoragePreview(): void {
    this.topStorageLoading.set(true);

    this.reportUsersService.getTopByStorageUsed()
      .pipe(finalize(() => this.topStorageLoading.set(false)))
      .subscribe({
        next: (response) => this.topStorage.set(response ?? []),
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar el top de usuarios por almacenamiento.',
            'Error al cargar dashboard'
          );
        }
      });
  }

  //Method to load most shared files preview (using 0-based page index)
  private loadMostSharedPreview(): void {
    this.mostSharedLoading.set(true);

    this.reportSharesService.getMostSharedFiles({
      page: 0,
      size: this.PREVIEW_LIMIT,
      direction: 'desc'
    })
      .pipe(finalize(() => this.mostSharedLoading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<MostSharedFileResponse>) => {
          this.mostShared.set(response.content ?? []);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar los archivos más compartidos.',
            'Error al cargar dashboard'
          );
        }
      });
  }

  //Method to load folders with most files preview (using 0-based page index)
  private loadTopFoldersPreview(): void {
    this.topFoldersLoading.set(true);

    this.reportFoldersService.getFoldersWithMostFiles({
      page: 0,
      size: this.PREVIEW_LIMIT,
    })
      .pipe(finalize(() => this.topFoldersLoading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<FolderWithMostFilesResponse>) => {
          this.topFolders.set(response.content ?? []);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar las carpetas con más archivos.',
            'Error al cargar dashboard'
          );
        }
      });
  }

  //Method to navigate to top file count report
  goToTopFileCountReport(): void {
    this.router.navigate([this.ROUTE_TOP_FILE_COUNT]);
  }

  //Method to navigate to top storage report
  goToTopStorageReport(): void {
    this.router.navigate([this.ROUTE_TOP_STORAGE]);
  }

  //Method to navigate to most shared files report
  goToMostSharedReport(): void {
    this.router.navigate([this.ROUTE_MOST_SHARED]);
  }

  //Method to navigate to folders with most files report
  goToTopFoldersReport(): void {
    this.router.navigate([this.ROUTE_TOP_FOLDERS]);
  }
}