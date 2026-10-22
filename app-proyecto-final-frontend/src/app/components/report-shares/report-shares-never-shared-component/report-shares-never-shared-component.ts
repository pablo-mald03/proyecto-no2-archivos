import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { ReportSharesKpiStrip } from '../../reports/report-shares-kpi-strip/report-shares-kpi-strip';
import { ReportSharesSegmentBar } from '../../reports/report-shares-segment-bar/report-shares-segment-bar';
import { ReportSharesVaultCard } from '../../reports/report-shares-vault-card/report-shares-vault-card';
import { ReportSharesService } from '../../../features/report-shares/service/report-shares.service';
import { ToastService } from '../../../core/services/toast.service';
import { NeverSharedFileResponse } from '../../../features/report-shares/models/response/never-shared-file-response.model';
import { buildAgeSegments } from '../../../core/ui/report-shares-shared/utils/build-age-segments.util';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { formatRelativeAge, getAgeInDays } from '../../../core/ui/report-shares-shared/utils/age-bucket.util';
import { formatBytes } from '../../../core/ui/report-users-shared/utils/format-bytes.util';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ReportSharesQueryParams } from '../../../features/report-shares/models/query/report-share-query-param.model';
import { ReportSharesFilterBarComponent } from '../report-shares-filter-bar-component/report-shares-filter-bar-component';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';
import { FilterDirectionOption } from '../report-shares-filter-bar-component/constants/filter-direction.constant';


@Component({
  selector: 'app-report-shares-never-shared-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIconComponent,
    CustomCard,
    CustomAlert,
    CustomPaginationSlide,
    ReportSharesKpiStrip,
    ReportSharesSegmentBar,
    ReportSharesVaultCard,
    ReportSharesFilterBarComponent
  ],
  templateUrl: './report-shares-never-shared-component.html',
  styleUrl: './report-shares-never-shared-component.css',
})
/*Files that have never been shared report component*/
export class ReportSharesNeverSharedComponent implements OnInit {

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

  readonly size = 12;

  // Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Data
  readonly files = signal<NeverSharedFileResponse[]>([]);

  readonly sortOptions: FilterDirectionOption[] = [
    { key: 'desc', label: 'Más recientes primero' },
    { key: 'asc', label: 'Más antiguos primero' }
  ];

  // Max size for scaling the bars
  readonly maxSize = computed(() =>
    Math.max(...this.files().map(f => f.sizeBytes), 1)
  );

  readonly segments = computed(() => buildAgeSegments(this.files().map(file => file.createdAt)));

  // Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const files = this.files();
    const bytes = files.reduce((acc, file) => acc + file.sizeBytes, 0);
    const oldest = files.reduce<NeverSharedFileResponse | null>(
      (best, file) => (!best || new Date(file.createdAt) < new Date(best.createdAt) ? file : best),
      null
    );

    return [
      { label: 'Archivos sin compartir', value: String(this.totalElements()) },
      { label: 'Peso en la página', value: formatBytes(bytes), hint: `${files.length} archivos` },
      {
        label: 'Más antiguo',
        value: oldest ? formatRelativeAge(getAgeInDays(oldest.createdAt)) : '—',
        hint: oldest?.fileName
      }
    ];
  });

  ngOnInit(): void {
    this.loadReport();
  }

  // Method to react to filter changes from the filter bar
  onFilterChange(newFilters: ReportSharesQueryParams): void {
    this.filters.set(newFilters);
    this.page.set(0);
    this.loadReport();
  }

  // Method to load the report for the current page and active filters
  loadReport(): void {
    this.requestSub?.unsubscribe();
    this.loading.set(true);

    const queryParams: ReportSharesQueryParams = {
      ...this.filters(),
      page: this.page(),
      size: this.size
    };

    this.requestSub = this.reportService.getNeverSharedFiles(queryParams)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<NeverSharedFileResponse>) => {
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