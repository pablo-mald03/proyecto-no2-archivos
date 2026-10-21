import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
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


@Component({
  selector: 'app-report-folders-most-files-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    CustomPagination,
    ReportFoldersKpiStrip,
    ReportFoldersMosaic,
    ReportFoldersRanking
  ],
  templateUrl: './report-folders-most-files-component.html',
  styleUrl: './report-folders-most-files-component.css',
})
/*Folders with the most files report */
export class ReportFoldersMostFilesComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportFoldersService);
  private readonly toastService = inject(ToastService);

  //Data signals
  readonly folders = signal<FolderWithMostFilesResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 10;

  //Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const folders = this.folders();
    const total = folders.reduce((acc, folder) => acc + folder.fileCount, 0);
    const top = folders.reduce<FolderWithMostFilesResponse | null>(
      (best, folder) => (!best || folder.fileCount > best.fileCount ? folder : best),
      null
    );

    return [
      { label: 'Carpetas', value: String(this.totalElements()), hint: 'con archivos' },
      { label: 'Archivos en la página', value: String(total) },
      { label: 'Carpeta líder', value: String(top?.fileCount ?? 0), hint: top?.folderName }
    ];
  });

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  ngOnInit(): void {
    this.loadReport();
  }

  //Method to load the report for the current page
  loadReport(): void {
    this.loading.set(true);

    this.reportService.getFoldersWithMostFiles({ page: this.page() + 1, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<FolderWithMostFilesResponse>) => {
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
