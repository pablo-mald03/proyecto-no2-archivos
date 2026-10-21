import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ToastService } from '../../../core/services/toast.service';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ReportFoldersService } from '../../../features/report-folders/service/report-folders.service';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ReportFoldersKpiStrip } from '../../reports/report-folders-kpi-strip/report-folders-kpi-strip';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { UserRootFolderSpaceResponse } from '../../../features/report-folders/models/response/user-root-folder-space-response.model';
import { ReportFoldersIdSearch } from '../../reports/report-folders-id-search/report-folders-id-search';
import { ReportFoldersSpaceDonut } from '../../reports/report-folders-space-donut/report-folders-space-donut';
import { ReportFoldersSpaceLegend } from '../../reports/report-folders-space-legend/report-folders-space-legend';
import { buildSpaceSlices } from '../../../core/ui/report-folders-shared/utils/build-space-slices.util';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';
@Component({
  selector: 'app-report-folders-user-space-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    CustomPagination,
    ReportFoldersKpiStrip,
    ReportFoldersIdSearch,
    ReportFoldersSpaceDonut,
    ReportFoldersSpaceLegend
  ],
  templateUrl: './report-folders-user-space-component.html',
  styleUrl: './report-folders-user-space-component.css',
})
/*Space used by the root folders of a user component */
export class ReportFoldersUserSpaceComponent {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportFoldersService);
  private readonly toastService = inject(ToastService);

  //Selected user
  readonly userId = signal<string | null>(null);

  //Data signals
  readonly folders = signal<UserRootFolderSpaceResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 8;

  //Slices of the donut
  readonly slices = computed(() => buildSpaceSlices(this.folders()));

  //Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const folders = this.folders();
    const bytes = folders.reduce((acc, folder) => acc + folder.totalSizeBytes, 0);
    const files = folders.reduce((acc, folder) => acc + folder.fileCount, 0);
    const heaviest = folders.reduce<UserRootFolderSpaceResponse | null>(
      (best, folder) => (!best || folder.totalSizeBytes > best.totalSizeBytes ? folder : best),
      null
    );

    return [
      { label: 'Carpetas raíz', value: String(this.totalElements()) },
      { label: 'Espacio en la página', value: formatBytes(bytes), hint: `${files} archivos` },
      { label: 'Carpeta más pesada', value: formatBytes(heaviest?.totalSizeBytes ?? 0), hint: heaviest?.folderName }
    ];
  });

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  //Method to handle user submission
  onUserSubmitted(userId: string): void {
    this.userId.set(userId);
    this.page.set(0);
    this.folders.set([]);
    this.loadReport();
  }

  //Method to load the report for the selected user and page
  loadReport(): void {
    const userId = this.userId();
    if (!userId) return;

    this.loading.set(true);

    this.reportService.getUserRootFoldersSpace(userId, { page: this.page() + 1, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<UserRootFolderSpaceResponse>) => {
          this.folders.set(response.content);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar el reporte.',
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
