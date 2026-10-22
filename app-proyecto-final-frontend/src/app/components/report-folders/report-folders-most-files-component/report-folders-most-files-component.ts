import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportFoldersKpiStrip } from '../../reports/report-folders-kpi-strip/report-folders-kpi-strip';
import { ReportFoldersMosaic } from '../../reports/report-folders-mosaic/report-folders-mosaic';
import { ReportFoldersRanking } from '../../reports/report-folders-ranking/report-folders-ranking';
import { ReportFoldersService } from '../../../features/report-folders/service/report-folders.service';
import { ToastService } from '../../../core/services/toast.service';
import { FolderWithMostFilesResponse } from '../../../features/report-folders/models/response/folder-with-most-files-response.model';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { FolderContentReportItemResponse } from '../../../features/report-folders/models/response/folder-content-report-item-response.model';
import { User } from '../../../features/users/models/user.model';
import { FolderResponse } from '../../../features/folders/models/response/folder-response.model';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';
import { ReportFoldersContentTree } from '../../reports/report-folders-content-tree/report-folders-content-tree';
import { ReportUserFolderFilterBarComponent } from '../report-user-folder-filter-bar-component/report-user-folder-filter-bar-component';


@Component({
  selector: 'app-report-folders-most-files-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    CustomPaginationSlide,
    ReportFoldersContentTree,
    ReportUserFolderFilterBarComponent
  ],
  templateUrl: './report-folders-most-files-component.html',
  styleUrl: './report-folders-most-files-component.css',
})
/*Folders with the most files report */
export class ReportFoldersMostFilesComponent {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportFoldersService);
  private readonly toastService = inject(ToastService);

  private requestSub?: Subscription;

  // Estado de Selección
  readonly selectedUser = signal<User | null>(null);
  readonly selectedFolder = signal<FolderResponse | null>(null);

  // Datos Paginados
  readonly items = signal<FolderContentReportItemResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0); // Base 0
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 15;

  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Captura el cambio secuencial
  onFilterSelectionChange(selection: { user: User | null; folder: FolderResponse | null }): void {
    this.selectedUser.set(selection.user);
    this.selectedFolder.set(selection.folder);
    this.page.set(0);
    this.items.set([]);

    if (selection.folder) {
      this.loadReport();
    }
  }

  loadReport(): void {
    const folder = this.selectedFolder();
    if (!folder) return;

    this.requestSub?.unsubscribe();
    this.loading.set(true);

    this.requestSub = this.reportService
      .getFolderContents(folder.id, { page: this.page(), size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<FolderContentReportItemResponse>) => {
          this.items.set(response.content ?? []);
          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
        },
        error: (error: ErrorResponse) => {
          this.items.set([]);
          this.toastService.error(
            error.message || 'No se pudo cargar el reporte de la carpeta.',
            'Error al cargar'
          );
        }
      });
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadReport();
  }

  goBack(): void {
    this.location.back();
  }
}