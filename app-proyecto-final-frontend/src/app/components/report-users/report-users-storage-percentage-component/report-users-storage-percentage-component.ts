import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { ReportUsersKpiStrip } from '../../reports/report-users-kpi-strip/report-users-kpi-strip';
import { ReportUsersStorageCard } from '../../reports/report-users-storage-card/report-users-storage-card';
import { ReportUsersLevelDistribution } from '../../reports/report-users-level-distribution/report-users-level-distribution';
import { ReportUsersService } from '../../../features/report-users/service/report-users.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserStoragePercentageResponse } from '../../../features/report-users/models/response/user-storage-percentage-response.model';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { getStorageUsageLevel } from '../../../core/ui/report-users-shared/utils/storage-usage.util';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';

@Component({
  selector: 'app-report-users-storage-percentage-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    ReportUsersKpiStrip,
    ReportUsersStorageCard,
    ReportUsersLevelDistribution,
    CustomPaginationSlide
  ],
  templateUrl: './report-users-storage-percentage-component.html',
  styleUrl: './report-users-storage-percentage-component.css',
})
/*Storage percentage component report */
export class ReportUsersStoragePercentageComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportUsersService);
  private readonly toastService = inject(ToastService);

  private request?: Subscription;

  // Data signals
  readonly users = signal<UserStoragePercentageResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 8;

  // Percentage formatter
  static formatPercentage(val: number): string {
    if (!val || val === 0) return '0%';
    const decimals = val < 0.01 ? 4 : 3;
    return `${val.toFixed(decimals)}%`;
  }

  // Percents of the current page
  readonly percents = computed(() => this.users().map(u => u.percentageUsed));

  // Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const percents = this.percents();
    const average = percents.length ? percents.reduce((acc, p) => acc + p, 0) / percents.length : 0;
    const critical = percents.filter(p => getStorageUsageLevel(p) === 'critical').length;

    return [
      { label: 'Usuarios', value: String(this.totalElements()), hint: 'con almacenamiento asignado' },
      { label: 'Uso promedio', value: ReportUsersStoragePercentageComponent.formatPercentage(average), hint: 'en la página actual' },
      { label: 'En nivel crítico', value: String(critical), hint: 'en la página actual' }
    ];
  });

  readonly lucideArrowLeftIcon = lucideArrowLeft;

  ngOnInit(): void {
    this.loadReport();
  }

  // Load the report for the current page
  loadReport(): void {
    this.request?.unsubscribe();
    this.loading.set(true);

    const targetPage = this.page();

    this.request = this.reportService
      .getStoragePercentage({ page: targetPage, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<UserStoragePercentageResponse>) => {
          this.users.set(response.content ?? []);
          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar el reporte.',
            'Error al cargar reporte'
          );
        }
      });
  }

  // Page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  // Back to the previous page
  goBack(): void {
    this.location.back();
  }
}