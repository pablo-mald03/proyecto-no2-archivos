import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, NgIconComponent } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportSharesKpiStrip } from '../../reports/report-shares-kpi-strip/report-shares-kpi-strip';
import { ReportSharesIdSearch } from '../../reports/report-shares-id-search/report-shares-id-search';
import { ReportSharesSegmentBar } from '../../reports/report-shares-segment-bar/report-shares-segment-bar';
import { ReportSharesOwnerGroups } from '../../reports/report-shares-owner-groups/report-shares-owner-groups';
import { ReportSharesService } from '../../../features/report-shares/service/report-shares.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReceivedByUserItemResponse } from '../../../features/report-shares/models/response/received-by-user-item-response.model';
import { ShareFlowEntry } from '../../../core/ui/report-shares-shared/types/share-flow-entry.model';
import { toShareFlowEntryFromReceived } from '../../../core/ui/report-shares-shared/utils/share-flow-entry.mapper';
import { buildAccessSegments } from '../../../core/ui/report-shares-shared/utils/build-access-segments.util';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ReportSharesQueryParams } from '../../../features/report-shares/models/query/report-share-query-param.model';
import { User } from '../../../features/users/models/user.model';
import { FilterDirectionOption } from '../report-shares-filter-bar-component/constants/filter-direction.constant';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';
import { ReportSharesUserFilterBarComponent } from '../report-shares-user-filter-bar-component/report-shares-user-filter-bar-component';


@Component({
  selector: 'app-report-shares-received-by-user-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIconComponent,
    CustomCard,
    CustomAlert,
    CustomPaginationSlide,
    ReportSharesKpiStrip,
    ReportSharesSegmentBar,
    ReportSharesOwnerGroups,
    ReportSharesUserFilterBarComponent
  ],
  templateUrl: './report-shares-received-by-user-component.html',
  styleUrl: './report-shares-received-by-user-component.css',
})
/*Resources received by a selected user report component */
export class ReportSharesReceivedByUserComponent {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportSharesService);
  private readonly toastService = inject(ToastService);

  private requestSub?: Subscription;

  // Selected user signal
  readonly selectedUser = signal<User | null>(null);

  // Filter query parameters signal
  readonly filters = signal<ReportSharesQueryParams>({ direction: 'desc' });

  // State signals
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 12;

  // Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Data
  readonly items = signal<ReceivedByUserItemResponse[]>([]);

  readonly entries = computed<ShareFlowEntry[]>(() => this.items().map(toShareFlowEntryFromReceived));
  readonly segments = computed(() => buildAccessSegments(this.items().map(item => item.accessLevel)));

  // Semantic sort options for received items
  readonly sortOptions: FilterDirectionOption[] = [
    { key: 'desc', label: 'Más recientes primero' },
    { key: 'asc', label: 'Más antiguos primero' }
  ];

  // Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const entries = this.entries();
    const owners = new Set(entries.map(entry => entry.counterpartEmail || entry.counterpartName)).size;
    const editable = entries.filter(entry => entry.accessLevel?.toUpperCase() === 'EDITOR').length;

    return [
      { label: 'Recursos recibidos', value: String(this.totalElements()) },
      { label: 'Remitentes', value: String(owners), hint: 'distintos en la página actual' },
      { label: 'Con permiso de edición', value: String(editable), hint: 'en la página actual' }
    ];
  });

  // Method to handle user and filters selection from the filter bar
  onFilterSelectionChange(selection: { user: User | null; filters: ReportSharesQueryParams }): void {
    this.selectedUser.set(selection.user);
    this.filters.set(selection.filters);
    this.page.set(0);
    this.items.set([]);

    if (selection.user) {
      this.loadReport();
    }
  }

  // Method to load the report for the selected user, filters and page
  loadReport(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.requestSub?.unsubscribe();
    this.loading.set(true);

    const queryParams: ReportSharesQueryParams = {
      ...this.filters(),
      page: this.page(),
      size: this.size
    };

    this.requestSub = this.reportService
      .getReceivedByUser(user.id, queryParams)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<ReceivedByUserItemResponse>) => {
          this.items.set(response.content ?? []);
          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
        },
        error: (error: ErrorResponse) => {
          this.items.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
          this.toastService.error(
            error.message || 'No fue posible cargar el reporte.',
            'Error al cargar reporte'
          );
        }
      });
  }

  // Method for page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  // Method to go back to the previous page
  goBack(): void {
    this.location.back();
  }
}