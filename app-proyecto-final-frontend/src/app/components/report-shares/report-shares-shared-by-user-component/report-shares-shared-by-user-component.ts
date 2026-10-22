import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize, Subscription } from 'rxjs';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ReportSharesKpiStrip } from '../../reports/report-shares-kpi-strip/report-shares-kpi-strip';
import { ReportSharesIdSearch } from '../../reports/report-shares-id-search/report-shares-id-search';
import { ReportSharesSegmentBar } from '../../reports/report-shares-segment-bar/report-shares-segment-bar';
import { ReportSharesTimeline } from '../../reports/report-shares-timeline/report-shares-timeline';
import { ToastService } from '../../../core/services/toast.service';
import { ReportSharesService } from '../../../features/report-shares/service/report-shares.service';
import { SharedByUserItemResponse } from '../../../features/report-shares/models/response/shared-by-user-item-response.model';
import { ShareFlowEntry } from '../../../core/ui/report-shares-shared/types/share-flow-entry.model';
import { toShareFlowEntryFromShared } from '../../../core/ui/report-shares-shared/utils/share-flow-entry.mapper';
import { buildAccessSegments } from '../../../core/ui/report-shares-shared/utils/build-access-segments.util';
import { KpiItem } from '../../../core/ui/report-users-shared/types/kpi-item.model';
import { PaginatedResponse } from '../../../features/report-shared/models/response/paginated-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { CustomPaginationSlide } from '../../common/custom-pagination-slide/custom-pagination-slide';
import { ReportSharesUserFilterBarComponent } from '../report-shares-user-filter-bar-component/report-shares-user-filter-bar-component';
import { ReportSharesQueryParams } from '../../../features/report-shares/models/query/report-share-query-param.model';
import { User } from '../../../features/users/models/user.model';
import { FilterDirectionOption } from '../report-shares-filter-bar-component/constants/filter-direction.constant';


@Component({
  selector: 'app-report-shares-shared-by-user-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIconComponent,
    CustomCard,
    CustomAlert,
    ReportSharesKpiStrip,
    ReportSharesSegmentBar,
    ReportSharesTimeline,
    ReportSharesUserFilterBarComponent,
    CustomPaginationSlide
  ],
  providers: [provideIcons({ lucideArrowLeft })],
  templateUrl: './report-shares-shared-by-user-component.html',
  styleUrl: './report-shares-shared-by-user-component.css',
})
/*Resources shared by a selected user report component*/
export class ReportSharesSharedByUserComponent {

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

  readonly size = 10;

  // Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  // Data
  readonly items = signal<SharedByUserItemResponse[]>([]);

  readonly entries = computed<ShareFlowEntry[]>(() => this.items().map(toShareFlowEntryFromShared));
  readonly segments = computed(() => buildAccessSegments(this.items().map(item => item.accessLevel)));

  // Semantic sort options for shared items timeline
  readonly sortOptions: FilterDirectionOption[] = [
    { key: 'desc', label: 'Más recientes primero' },
    { key: 'asc', label: 'Más antiguos primero' }
  ];

  // Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const entries = this.entries();
    const folders = entries.filter(entry => entry.resourceType === 'FOLDER').length;
    const files = entries.length - folders;
    const grantees = new Set(entries.map(entry => entry.counterpartEmail || entry.counterpartName)).size;

    return [
      { label: 'Recursos compartidos', value: String(this.totalElements()) },
      { label: 'Archivos · carpetas', value: `${files} · ${folders}`, hint: 'en la página actual' },
      { label: 'Destinatarios', value: String(grantees), hint: 'distintos en la página actual' }
    ];
  });

  // Method to handle user and filter selection changes
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
      .getSharedByUser(user.id, queryParams)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<SharedByUserItemResponse>) => {
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