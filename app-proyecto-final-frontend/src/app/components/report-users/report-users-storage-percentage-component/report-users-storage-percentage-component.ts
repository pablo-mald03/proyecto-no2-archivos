import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportUsersKpiStrip } from '../../reports/report-users-kpi-strip/report-users-kpi-strip';
import { ReportUsersStorageCard } from '../../reports/report-users-storage-card/report-users-storage-card';
import { ReportUsersLevelDistribution } from '../../reports/report-users-level-distribution/report-users-level-distribution';
import { ReportUsersService } from '../../../features/report-users/service/report-users.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserStoragePercentageResponse } from '../../../features/report-users/models/response/user-storage-percentage-response.model';
import { KpiItem } from '../../reports/report-users-shared/types/kpi-item.model';
import { getStorageUsageLevel } from '../../reports/report-users-shared/utils/storage-usage.util';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';

@Component({
  selector: 'app-report-users-storage-percentage-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    CustomPagination,
    ReportUsersKpiStrip,
    ReportUsersStorageCard,
    ReportUsersLevelDistribution
  ],
  templateUrl: './report-users-storage-percentage-component.html',
  styleUrl: './report-users-storage-percentage-component.css',
})
/*Storage percentage used by each user report */
export class ReportUsersStoragePercentageComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportUsersService);
  private readonly toastService = inject(ToastService);

  //Data signals
  readonly users = signal<UserStoragePercentageResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 8;

  //Percents of the current page
  readonly percents = computed(() => this.users().map(u => u.percentageUsed));

  //Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const percents = this.percents();
    const average = percents.length ? percents.reduce((acc, p) => acc + p, 0) / percents.length : 0;
    const critical = percents.filter(p => getStorageUsageLevel(p) === 'critical').length;

    return [
      { label: 'Usuarios', value: String(this.totalElements()), hint: 'con almacenamiento asignado' },
      { label: 'Uso promedio', value: `${average.toFixed(1)}%`, hint: 'en la página actual' },
      { label: 'En nivel crítico', value: String(critical), hint: 'en la página actual' }
    ];
  });

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  ngOnInit(): void {
    this.loadReport();
  }

  //Load the report for the current page
  loadReport(): void {
    this.loading.set(true);

    //The UI page is 0-based, the API page is 1-based
    this.reportService.getStoragePercentage({ page: this.page() + 1, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<UserStoragePercentageResponse>) => {
          this.users.set(response.content);
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

  //Page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  //Back to the previous page
  goBack(): void {
    this.location.back();
  }
}
