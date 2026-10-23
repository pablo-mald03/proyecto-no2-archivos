import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomDatepicker } from '../../common/custom-datepicker/custom-datepicker';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { EmptyStateComponent } from '../../common/empty-state-component/empty-state-component';
import { FileActivityCardComponent } from '../file-activity-card-component/file-activity-card-component';
import { lucideActivity, lucideCalendar, lucideHistory, lucideRotateCcw, lucideSlidersHorizontal, lucideX } from '@ng-icons/lucide';
import { LogService } from '../../../features/logs/services/log.service';
import { ToastService } from '../../../core/services/toast.service';
import { Log } from '../../../features/logs/models/log.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogQuery } from '../../../features/logs/models/query/log-query.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-file-activity-panel-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
    CustomDropdown,
    CustomDatepicker,
    CustomButton,
    CustomInfiniteScroll,
    EmptyStateComponent,
    FileActivityCardComponent
  ],
  providers: [
    provideIcons({
      lucideHistory,
      lucideX,
      lucideSlidersHorizontal,
      lucideRotateCcw,
      lucideActivity,
      lucideCalendar
    })
  ],
  templateUrl: './file-activity-panel-component.html',
  styleUrl: './file-activity-panel-component.css',
})
/* Sliding activity logs panel with infinite scroll and filters for resource activity */
export class FileActivityPanelComponent implements OnInit {

  private readonly logService = inject(LogService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Inputs & Outputs
  readonly resourceId = input<string | null>(null);
  readonly resourceType = input<'FILE' | 'FOLDER'>('FILE');
  readonly isOpen = input<boolean>(true);

  readonly closePanel = output<void>();

  // Data signals
  readonly logs = signal<Log[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly initialized = signal(false);

  // Pagination
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly size = 15;
  readonly hasMore = computed(() => this.page() + 1 < this.totalPages());

  // Filter UI State
  readonly filtersExpanded = signal(false);

  // Filter Catalog
  readonly actions = signal<{ value: string; label: string }[]>([
    { value: '', label: 'Todas las acciones' }
  ]);

  // Controls
  readonly actionControl = new FormControl('', { nonNullable: true });
  readonly fromDateControl = new FormControl('', { nonNullable: true });
  readonly toDateControl = new FormControl('', { nonNullable: true });
  readonly directionControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });

  readonly directionOptions = [
    { value: 'desc', label: 'Más recientes primero' },
    { value: 'asc', label: 'Más antiguos primero' }
  ];

  // Icons
  readonly lucideHistoryIcon = lucideHistory;
  readonly lucideXIcon = lucideX;
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucideActivityIcon = lucideActivity;

  private requestVersion = 0;

  constructor() {
    effect(() => {
      const id = this.resourceId();
      const open = this.isOpen();

      if (open && id) {
        this.fetchLogs({ reset: true });
      }
    });
  }

  ngOnInit(): void {
    this.loadCatalog();

    this.actionControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.fromDateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.toDateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.directionControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());
  }

  // Load available action filters catalog
  loadCatalog(): void {
    this.logService.getCatalog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: catalog => {
          this.actions.set([
            { value: '', label: 'Todas las acciones' },
            ...catalog.actions.map(item => ({
              value: item.code,
              label: item.label
            }))
          ]);
        },
        error: () => {
          this.actions.set([{ value: '', label: 'Todas las acciones' }]);
        }
      });
  }

  // Fetch paginated activity logs with infinite scroll support
  fetchLogs({ reset = false }: { reset?: boolean } = {}): void {
    const resId = this.resourceId();
    if (!resId) return;

    const version = ++this.requestVersion;
    const targetPage = reset ? 0 : this.page() + 1;

    if (reset) {
      this.loading.set(true);
      this.initialized.set(false);
    } else {
      this.loadingMore.set(true);
    }

    const query: LogQuery = {
      page: targetPage,
      size: this.size,
      resourceId: resId,
      resourceType: this.resourceType(),
      action: this.actionControl.value || undefined,
      direction: this.directionControl.value,
      sortBy: 'createdAt',
      from: this.toApiDate(this.fromDateControl.value, false),
      to: this.toApiDate(this.toDateControl.value, true)
    };

    this.logService.getLogs(query)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (version === this.requestVersion) {
            this.loading.set(false);
            this.loadingMore.set(false);
            this.initialized.set(true);
          }
        })
      )
      .subscribe({
        next: response => {
          if (version !== this.requestVersion) return;

          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
          this.page.set(targetPage);

          if (reset) {
            this.logs.set(response.content ?? []);
          } else {
            this.logs.update(prev => [...prev, ...(response.content ?? [])]);
          }
        },
        error: (error) => {
          if (version !== this.requestVersion) return;

          if (reset) {
            this.logs.set([]);
            this.totalPages.set(0);
            this.totalElements.set(0);
          }
          this.toastService.error(
            error.message || 'No fue posible cargar el historial de actividad.',
            'Error al cargar actividad'
          );
        }
      });
  }

  // Load next page on scroll bottom
  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;
    this.fetchLogs({ reset: false });
  }

  // Check if any filter is active
  hasActiveFilters(): boolean {
    return !!(
      this.actionControl.value ||
      this.fromDateControl.value ||
      this.toDateControl.value ||
      this.directionControl.value !== 'desc'
    );
  }

  // Reset filter controls
  resetFilters(): void {
    this.actionControl.setValue('', { emitEvent: false });
    this.fromDateControl.setValue('', { emitEvent: false });
    this.toDateControl.setValue('', { emitEvent: false });
    this.directionControl.setValue('desc', { emitEvent: false });
    this.onFilterChange();
  }

  private onFilterChange(): void {
    this.fetchLogs({ reset: true });
  }

  // Date boundary formatter
  private toApiDate(value: string, endOfDay: boolean): string | undefined {
    if (!value) return undefined;
    const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
}