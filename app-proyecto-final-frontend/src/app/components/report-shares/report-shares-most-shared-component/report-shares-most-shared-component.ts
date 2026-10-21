import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { ReportSharesKpiStrip } from '../../reports/report-shares-kpi-strip/report-shares-kpi-strip';
import { ReportSharesOrbitCard } from '../../reports/report-shares-orbit-card/report-shares-orbit-card';
import { ReportSharesService } from '../../../features/report-shares/service/report-shares.service';
import { ToastService } from '../../../core/services/toast.service';
import { MostSharedFileResponse } from '../../../features/report-shares/models/response/most-shared-file-response.model';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ReportSharesQueryParams } from '../../../features/report-shares/models/query/report-share-query-param.model';
import { ReportSharesFilterBarComponent } from '../report-shares-filter-bar-component/report-shares-filter-bar-component';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';
import { FilterDirectionOption } from '../report-shares-filter-bar-component/constants/filter-direction.constant';


@Component({
  selector: 'app-report-shares-most-shared-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIconComponent,
    CustomCard,
    CustomAlert,
    CustomPaginationSlide,
    ReportSharesKpiStrip,
    ReportSharesOrbitCard,
    ReportSharesFilterBarComponent
  ],
  templateUrl: './report-shares-most-shared-component.html',
  styleUrl: './report-shares-most-shared-component.css',
})
/*Files shared with the most users report */
export class ReportSharesMostSharedComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportSharesService);
  private readonly toastService = inject(ToastService);

  private requestSub?: Subscription;

  // State signals
  readonly loading = signal(false);
  readonly page = signal(0); // 0-based index
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly filters = signal<ReportSharesQueryParams>({ direction: 'desc' });

  readonly size = 8;

  // Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Data
  readonly files = signal<MostSharedFileResponse[]>([]);

  readonly sortOptions: FilterDirectionOption[] = [
    { key: 'desc', label: 'Más compartidos primero' },
    { key: 'asc', label: 'Menos compartidos primero' }
  ];

  // Max value for scaling the orbits
  readonly maxShares = computed(() =>
    Math.max(...this.files().map(f => f.shareCount), 1)
  );

  // Summary of the current page
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

  // Method to react to filter changes
  onFilterChange(newFilters: ReportSharesQueryParams): void {
    this.filters.set(newFilters);
    this.page.set(0);
    this.loadReport();
  }

  // Method to load the report for the current page and filters
  loadReport(): void {
    this.requestSub?.unsubscribe();
    this.loading.set(true);

    const queryParams: ReportSharesQueryParams = {
      ...this.filters(),
      page: this.page(),
      size: this.size
    };

    this.requestSub = this.reportService.getMostSharedFiles(queryParams)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<MostSharedFileResponse>) => {
          this.files.set(response.content ?? []);
          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
        },
        error: (error: ErrorResponse) => {
          this.files.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
          this.toastService.error(
            error.message || 'No fue posible cargar el reporte.',
            'Error al cargar reporte'
          );
        }
      });
  }

  // Method to react to page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  // Method to go back to the previous page
  goBack(): void {
    this.location.back();
  }
}