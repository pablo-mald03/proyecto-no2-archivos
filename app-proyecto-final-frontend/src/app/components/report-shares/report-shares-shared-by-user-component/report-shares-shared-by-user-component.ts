import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
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


@Component({
  selector: 'app-report-shares-shared-by-user-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert,
    CustomPagination,
    ReportSharesKpiStrip,
    ReportSharesIdSearch,
    ReportSharesSegmentBar,
    ReportSharesTimeline
  ],
  templateUrl: './report-shares-shared-by-user-component.html',
  styleUrl: './report-shares-shared-by-user-component.css',
})
/*Resources shared by a selected user report component*/
export class ReportSharesSharedByUserComponent {

  private readonly location = inject(Location);
  private readonly reportService = inject(ReportSharesService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly size = 10;

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  //Selected user
  readonly userId = signal<string | null>(null);

  //Data
  readonly items = signal<SharedByUserItemResponse[]>([]);

  readonly entries = computed<ShareFlowEntry[]>(() => this.items().map(toShareFlowEntryFromShared));
  readonly segments = computed(() => buildAccessSegments(this.items().map(item => item.accessLevel)));

  //Summary of the current page
  readonly kpis = computed<KpiItem[]>(() => {
    const entries = this.entries();
    const folders = entries.filter(entry => entry.resourceType === 'FOLDER').length;
    const grantees = new Set(entries.map(entry => entry.counterpartEmail || entry.counterpartName)).size;

    return [
      { label: 'Recursos compartidos', value: String(this.totalElements()) },
      { label: 'Archivos · carpetas', value: `${entries.length - folders} · ${folders}`, hint: 'en la página actual' },
      { label: 'Destinatarios', value: String(grantees), hint: 'distintos en la página actual' }
    ];
  });

  //A new user always starts from the first page
  onUserSubmitted(userId: string): void {
    this.userId.set(userId);
    this.page.set(0);
    this.items.set([]);
    this.loadReport();
  }

  //Load the report for the selected user and page
  loadReport(): void {
    const userId = this.userId();
    if (!userId) return;

    this.loading.set(true);

    //The UI page is 0-based, the API page is 1-based
    this.reportService.getSharedByUser(userId, { page: this.page() + 1, size: this.size })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<SharedByUserItemResponse>) => {
          this.items.set(response.content);
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

  //Method to page change from the pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReport();
  }

  //Method to go back to the previous page
  goBack(): void {
    this.location.back();
  }
}
