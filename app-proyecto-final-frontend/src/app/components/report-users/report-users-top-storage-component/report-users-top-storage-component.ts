import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { ReportUsersPodium } from '../../reports/report-users-podium/report-users-podium';
import { ReportUsersKpiStrip } from '../../reports/report-users-kpi-strip/report-users-kpi-strip';
import { ReportUsersTopFilters } from '../../reports/report-users-top-filters/report-users-top-filters';
import { ReportUsersService } from '../../../features/report-users/service/report-users.service';
import { ToastService } from '../../../core/services/toast.service';
import { TopUserByStorageResponse } from '../../../features/report-users/models/response/top-user-by-storage-response.model';
import { TopUsersReportParams } from '../../../features/report-users/models/request/top-users-report-params.model';
import { toPodiumEntryByStorage } from '../../reports/report-users-shared/utils/podium-entry.mapper';
import { KpiItem } from '../../reports/report-users-shared/types/kpi-item.model';
import { formatBytes } from '../../reports/report-users-shared/utils/format-bytes.util';
import { calculateUsagePercent } from '../../reports/report-users-shared/utils/storage-usage.util';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';

@Component({
  selector: 'app-report-users-top-storage-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, CustomCard, CustomAlert, ReportUsersPodium, ReportUsersKpiStrip, ReportUsersTopFilters],
  templateUrl: './report-users-top-storage-component.html',
  styleUrl: './report-users-top-storage-component.css',
})
/*Top users by storage used report with podium visualization */
export class ReportUsersTopStorageComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportUsersService);
  private readonly toastService = inject(ToastService);

  private request?: Subscription;

  //Data
  readonly users = signal<TopUserByStorageResponse[]>([]);
  readonly loading = signal(false);
  readonly filters = signal<TopUsersReportParams>({});

  //Podium entries
  readonly entries = computed(() => this.users().map(toPodiumEntryByStorage));

  //Summary of the ranking
  readonly kpis = computed<KpiItem[]>(() => {
    const users = this.users();
    const used = users.reduce((acc, user) => acc + user.usedBytes, 0);
    const quota = users.reduce((acc, user) => acc + user.quotaBytes, 0);

    return [
      { label: 'Almacenamiento usado', value: formatBytes(used), hint: 'por los usuarios del ranking' },
      { label: 'Cuota asignada', value: formatBytes(quota), hint: 'suma de las cuotas' },
      { label: 'Uso de la cuota', value: `${calculateUsagePercent(used, quota).toFixed(2)}%`, hint: 'del ranking completo' }
    ];
  });

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  ngOnInit(): void {
    this.loadReport();
  }

  //Load the report with the current filters
  loadReport(): void {
    this.request?.unsubscribe();
    this.loading.set(true);

    this.request = this.reportService.getTopByStorageUsed(this.filters())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.users.set(response),
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar el reporte.',
            'Error al cargar reporte'
          );
        }
      });
  }

  //Filters changed from the filters component
  onFiltersChange(filters: TopUsersReportParams): void {
    this.filters.set(filters);
    this.loadReport();
  }

  //Back to the previous page
  goBack(): void {
    this.location.back();
  }
}
