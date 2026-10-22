import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { ReportFoldersKpiStrip } from '../../reports/report-folders-kpi-strip/report-folders-kpi-strip';
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
import { User } from '../../../features/users/models/user.model';
import { FolderResponse } from '../../../features/folders/models/response/folder-response.model';
import { ReportUserFolderFilterBarComponent } from '../report-user-folder-filter-bar-component/report-user-folder-filter-bar-component';
import { NgIconComponent } from '@ng-icons/core';


@Component({
  selector: 'app-report-folders-contents-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIconComponent,
    CustomCard,
    CustomAlert,
    CustomPaginationSlide,
    ReportUserFolderFilterBarComponent,
    ReportFoldersKpiStrip,
    ReportFoldersContentTree,
    ReportFoldersExtensionBreakdown
  ],
  templateUrl: './report-folders-contents-component.html',
  styleUrl: './report-folders-contents-component.css',
})
/*Contents of a folder and its subfolders report component */
export class ReportFoldersContentsComponent {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportFoldersService);
  private readonly toastService = inject(ToastService);

  private requestSub?: Subscription;

  //Selected user and folder
  readonly selectedUser = signal<User | null>(null);
  readonly selectedFolder = signal<FolderResponse | null>(null);

  //Data signals
  readonly items = signal<FolderContentReportItemResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 20;

  //Summary of the current page
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

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  //Method to handle selection changes from the filter bar
  onFilterSelectionChange(selection: { user: User | null; folder: FolderResponse | null }): void {
    this.selectedUser.set(selection.user);
    this.selectedFolder.set(selection.folder);
    this.page.set(0);
    this.items.set([]);

    if (selection.folder) {
      this.loadReport();
    }
  }

  //Method to load the contents of the selected folder and subfolders
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
          this.totalPages.set(0);
          this.totalElements.set(0);
          this.toastService.error(
            error.message || 'No fue posible cargar el contenido de la carpeta.',
            'Error al cargar reporte'
          );
        }
      });
  }

  //Method to handle page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  //Method to go back to the previous page
  goBack(): void {
    this.location.back();
  }
}