import { Location } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportUsersKpiStrip } from '../../reports/report-users-kpi-strip/report-users-kpi-strip';
import { ReportUsersShareBubbles } from '../../reports/report-users-share-bubbles/report-users-share-bubbles';
import { ReportUsersShareRanking } from '../../reports/report-users-share-ranking/report-users-share-ranking';
import { ToastService } from '../../../core/services/toast.service';
import { ReportUsersService } from '../../../features/report-users/service/report-users.service';
import { UserShareCountResponse } from '../../../features/report-users/models/response/user-share-count-response.model';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
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

  // Guarda la petición activa para cancelarla si el usuario cambia de página rápido
  private request?: Subscription;

  // Data signals
  readonly users = signal<UserShareCountResponse[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0); // Página actual (inicia en 0)
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 10;

  // Resumen calculado de la página actual
  readonly kpis = computed<KpiItem[]>(() => {
    const users = this.users();
    const total = users.reduce((acc, user) => acc + (user.shareCount ?? 0), 0);
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

  // Íconos
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  ngOnInit(): void {
    this.loadReport();
  }

  // Carga los datos solicitando la página correspondiente
  loadReport(): void {
    // 1. Cancela la petición anterior si aún no terminaba
    this.request?.unsubscribe();
    this.loading.set(true);

    // 2. OJO AQUÍ: Si en Swagger la primera página es 0, usa `this.page()`.
    //    Si en Swagger la primera página es 1, cambia a `this.page() + 1`.
    const pageParam = this.page();

    this.request = this.reportService
      .getShareCount({ page: pageParam, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<UserShareCountResponse>) => {
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

  // Cambio de página desde el paginador de tu vista
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  // Volver
  goBack(): void {
    this.location.back();
  }
}