import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { ReportUsersPodium } from '../../reports/report-users-podium/report-users-podium';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomCard } from '../../common/custom-card/custom-card';
import { ReportUsersKpiStrip } from '../../reports/report-users-kpi-strip/report-users-kpi-strip';
import { ReportUsersTopFilters } from '../../reports/report-users-top-filters/report-users-top-filters';
import { ReportUsersService } from '../../../features/report-users/service/report-users.service';
import { ToastService } from '../../../core/services/toast.service';
import { TopUserByFileCountResponse } from '../../../features/report-users/models/response/top-user-by-file-count-response.model';
import { TopUsersReportParams } from '../../../features/report-users/models/request/top-users-report-params.model';
import { toPodiumEntryByFileCount } from '../../../core/ui/report-users-shared/utils/podium-entry.mapper';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';

@Component({
  selector: 'app-report-users-top-file-count-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, CustomCard, CustomAlert, ReportUsersPodium, ReportUsersKpiStrip, ReportUsersTopFilters],
  templateUrl: './report-users-top-file-count-component.html',
  styleUrl: './report-users-top-file-count-component.css',
})
/*Top users by file count report with podium visualization */
export class ReportUsersTopFileCountComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportUsersService);
  private readonly toastService = inject(ToastService);

  private request?: Subscription;

  //Data
  readonly users = signal<TopUserByFileCountResponse[]>([]);
  readonly loading = signal(false);
  readonly filters = signal<TopUsersReportParams>({});

  //Podium entries
  readonly entries = computed(() => this.users().map(toPodiumEntryByFileCount));

  //Summary of the ranking
  readonly kpis = computed<KpiItem[]>(() => {
    const users = this.users();
    const total = users.reduce((acc, user) => acc + user.fileCount, 0);
    const average = users.length ? Math.round(total / users.length) : 0;

    return [
      { label: 'Usuarios en el ranking', value: String(users.length) },
      { label: 'Archivos del ranking', value: String(total) },
      { label: 'Promedio por usuario', value: String(average), hint: 'archivos' }
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

    this.request = this.reportService.getTopByFileCount(this.filters())
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
