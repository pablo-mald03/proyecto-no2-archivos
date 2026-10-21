import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportUsersKpiStrip } from '../../reports/report-users-kpi-strip/report-users-kpi-strip';
import { ReportUsersShareBubbles } from '../../reports/report-users-share-bubbles/report-users-share-bubbles';
import { ReportUsersShareRanking } from '../../reports/report-users-share-ranking/report-users-share-ranking';
import { ToastService } from '../../../core/services/toast.service';
import { ReportUsersService } from '../../../features/report-users/service/report-users.service';
import { UserShareCountResponse } from '../../../features/report-users/models/response/user-share-count-response.model';
import { KpiItem } from '../../reports/report-users-shared/types/kpi-item.model';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';


@Component({
  selector: 'app-report-users-share-count-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    CustomPagination,
    ReportUsersKpiStrip,
    ReportUsersShareBubbles,
    ReportUsersShareRanking
  ],
  templateUrl: './report-users-share-count-component.html',
  styleUrl: './report-users-share-count-component.css',
})
/*Share count of each user report */
export class ReportUsersShareCountComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportUsersService);
  private readonly toastService = inject(ToastService);

  //Data signals
  readonly users = signal<UserShareCountResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 10;

  //Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const users = this.users();
    const total = users.reduce((acc, user) => acc + user.shareCount, 0);
    const top = users.reduce<UserShareCountResponse | null>(
      (best, user) => (!best || user.shareCount > best.shareCount ? user : best),
      null
    );

    return [
      { label: 'Usuarios', value: String(this.totalElements()), hint: 'en el reporte' },
      { label: 'Compartidos en la página', value: String(total) },
      { label: 'Mayor cantidad', value: String(top?.shareCount ?? 0), hint: top?.fullName }
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
    this.reportService.getShareCount({ page: this.page() + 1, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<UserShareCountResponse>) => {
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
