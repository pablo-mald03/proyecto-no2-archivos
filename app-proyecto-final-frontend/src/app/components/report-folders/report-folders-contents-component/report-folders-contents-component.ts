import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportFoldersKpiStrip } from '../../reports/report-folders-kpi-strip/report-folders-kpi-strip';
import { ReportFoldersIdSearch } from '../../reports/report-folders-id-search/report-folders-id-search';
import { ReportFoldersContentTree } from '../../reports/report-folders-content-tree/report-folders-content-tree';
import { ReportFoldersExtensionBreakdown } from '../../reports/report-folders-extension-breakdown/report-folders-extension-breakdown';
import { ReportFoldersService } from '../../../features/report-folders/service/report-folders.service';
import { ToastService } from '../../../core/services/toast.service';
import { FolderContentReportItemResponse } from '../../../features/report-folders/models/response/folder-content-report-item-response.model';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';


@Component({
  selector: 'app-report-folders-contents-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    ReportFoldersKpiStrip,
    ReportFoldersIdSearch,
    ReportFoldersContentTree,
    ReportFoldersExtensionBreakdown,
    CustomPaginationSlide
  ],
  templateUrl: './report-folders-contents-component.html',
  styleUrl: './report-folders-contents-component.css',
})
/*Contents of a folder and its subfolders report component */
export class ReportFoldersContentsComponent {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportFoldersService);
  private readonly toastService = inject(ToastService);

  private request?: Subscription;

  //Selected folder
  readonly folderId = signal<string | null>(null);

  //Data signals
  readonly items = signal<FolderContentReportItemResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 20;

  // Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const items = this.items();
    const folders = items.filter(item => item.resourceType === 'FOLDER').length;
    const files = items.length - folders;
    const bytes = items.reduce((acc, item) => acc + (item.sizeBytes ?? 0), 0);

    return [
      { label: 'Recursos', value: String(this.totalElements()), hint: 'en la carpeta y subcarpetas' },
      { label: 'Carpetas · archivos', value: `${folders} · ${files}`, hint: 'en la página actual' },
      { label: 'Peso de los archivos', value: formatBytes(bytes), hint: 'en la página actual' }
    ];
  });

  // Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Submit al buscar un folderId
  onFolderSubmitted(folderId: string): void {
    const cleanId = folderId.trim();
    if (!cleanId) return;

    this.folderId.set(cleanId);
    this.page.set(0);
    this.items.set([]);
    this.loadReport();
  }

  // Method to load the contents of the folder and subfolders
  loadReport(): void {
    const folderId = this.folderId();
    if (!folderId) return;

    this.request?.unsubscribe();
    this.loading.set(true);

    const targetPage = this.page();

    this.request = this.reportService
      .getFolderContents(folderId, { page: targetPage, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<FolderContentReportItemResponse>) => {
          this.items.set(response.content ?? []);
          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
        },
        error: (error: ErrorResponse) => {
          this.items.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
          this.toastService.error(
            error.message || 'No fue posible cargar el contenido de la carpeta.',
            'Error al cargar reporte'
          );
        }
      });
  }

  // Method to handle page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  // Method to go back to the previous page
  goBack(): void {
    this.location.back();
  }
}