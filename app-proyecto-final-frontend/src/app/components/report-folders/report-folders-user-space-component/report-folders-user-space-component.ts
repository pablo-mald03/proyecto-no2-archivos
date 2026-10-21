import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { ToastService } from '../../../core/services/toast.service';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ReportFoldersService } from '../../../features/report-folders/service/report-folders.service';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ReportFoldersKpiStrip } from '../../reports/report-folders-kpi-strip/report-folders-kpi-strip';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { UserRootFolderSpaceResponse } from '../../../features/report-folders/models/response/user-root-folder-space-response.model';
import { ReportFoldersSpaceDonut } from '../../reports/report-folders-space-donut/report-folders-space-donut';
import { ReportFoldersSpaceLegend } from '../../reports/report-folders-space-legend/report-folders-space-legend';
import { buildSpaceSlices } from '../../../core/ui/report-folders-shared/utils/build-space-slices.util';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';
import { User } from '../../../features/users/models/user.model';
import { FolderResponse } from '../../../features/folders/models/response/folder-response.model';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';
import { ReportUserFolderFilterBarComponent } from '../report-user-folder-filter-bar-component/report-user-folder-filter-bar-component';
@Component({
  selector: 'app-report-folders-user-space-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    ReportFoldersKpiStrip,
    ReportFoldersSpaceDonut,
    ReportFoldersSpaceLegend,
    CustomPaginationSlide,
    ReportUserFolderFilterBarComponent
  ],
  templateUrl: './report-folders-user-space-component.html',
  styleUrl: './report-folders-user-space-component.css',
})
/*Space used by the root folders of a user component */
export class ReportFoldersUserSpaceComponent {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportFoldersService);
  private readonly toastService = inject(ToastService);

  private requestSub?: Subscription;

  //Selected user
  readonly selectedUser = signal<User | null>(null);

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

  //Method to handle filter selection changes
  onFilterSelectionChange(selection: { user: User | null; folder: FolderResponse | null }): void {
    this.selectedUser.set(selection.user);
    this.page.set(0);
    this.folders.set([]);

    if (selection.user) {
      this.loadReport();
    }
  }

  //Method to load the report for the selected user and page
  loadReport(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.requestSub?.unsubscribe();
    this.loading.set(true);

    this.requestSub = this.reportService
      .getUserRootFoldersSpace(user.id, { page: this.page(), size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<UserRootFolderSpaceResponse>) => {
          this.folders.set(response.content ?? []);
          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
        },
        error: (error: ErrorResponse) => {
          this.folders.set([]);
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