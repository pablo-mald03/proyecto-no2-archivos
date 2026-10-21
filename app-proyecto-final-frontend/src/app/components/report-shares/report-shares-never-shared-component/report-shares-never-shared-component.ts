import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
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


@Component({
  selector: 'app-report-shares-never-shared-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    CustomPagination,
    ReportSharesKpiStrip,
    ReportSharesSegmentBar,
    ReportSharesVaultCard
  ],
  templateUrl: './report-shares-never-shared-component.html',
  styleUrl: './report-shares-never-shared-component.css',
})
/*Files that have never been shared report */
export class ReportSharesNeverSharedComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportSharesService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 12;

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  //Data
  readonly files = signal<NeverSharedFileResponse[]>([]);

  // Max size for scaling the bars
  readonly maxSize = computed(() =>
    Math.max(...this.files().map(f => f.sizeBytes), 1)
  );

  readonly segments = computed(() => buildAgeSegments(this.files().map(file => file.createdAt)));

  //Summary of the current page
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

  //Load the report for the current page
  loadReport(): void {
    this.loading.set(true);

    this.reportService.getNeverSharedFiles({ page: this.page() + 1, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<NeverSharedFileResponse>) => {
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
