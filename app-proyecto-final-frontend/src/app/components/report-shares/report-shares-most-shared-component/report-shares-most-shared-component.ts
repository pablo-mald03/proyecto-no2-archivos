import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportSharesKpiStrip } from '../../reports/report-shares-kpi-strip/report-shares-kpi-strip';
import { ReportSharesOrbitCard } from '../../reports/report-shares-orbit-card/report-shares-orbit-card';
import { ReportSharesService } from '../../../features/report-shares/service/report-shares.service';
import { ToastService } from '../../../core/services/toast.service';
import { MostSharedFileResponse } from '../../../features/report-shares/models/response/most-shared-file-response.model';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';


@Component({
  selector: 'app-report-shares-most-shared-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, CustomCard, CustomAlert, CustomPagination, ReportSharesKpiStrip, ReportSharesOrbitCard],
  templateUrl: './report-shares-most-shared-component.html',
  styleUrl: './report-shares-most-shared-component.css',
})
/*Files shared with the most users report */
export class ReportSharesMostSharedComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportSharesService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 8;

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  //Data
  readonly files = signal<MostSharedFileResponse[]>([]);

  // Max value for scaling the orbits
  readonly maxShares = computed(() =>
    Math.max(...this.files().map(f => f.shareCount), 1)
  );

  //Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const files = this.files();
    const total = files.reduce((acc, file) => acc + file.shareCount, 0);
    const top = files.reduce<MostSharedFileResponse | null>(
      (best, file) => (!best || file.shareCount > best.shareCount ? file : best),
      null
    );

    return [
      { label: 'Archivos compartidos', value: String(this.totalElements()) },
      { label: 'Accesos en la página', value: String(total), hint: 'usuarios con acceso' },
      { label: 'Mayor alcance', value: String(top?.shareCount ?? 0), hint: top?.fileName }
    ];
  });

  ngOnInit(): void {
    this.loadReport();
  }

  //Load the report for the current page
  loadReport(): void {
    this.loading.set(true);

    this.reportService.getMostSharedFiles({ page: this.page() + 1, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<MostSharedFileResponse>) => {
          this.files.set(response.content);
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

  //Method to react to page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  //Method to go back to the previous page
  goBack(): void {
    this.location.back();
  }
}
