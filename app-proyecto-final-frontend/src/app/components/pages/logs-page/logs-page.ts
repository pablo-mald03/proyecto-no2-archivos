import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CustomTable } from '../../common/custom-table/custom-table';
import { LogService } from '../../../features/logs/services/log.service';
import { ToastService } from '../../../core/services/toast.service';
import { Log } from '../../../features/logs/models/log.model';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomDatepicker } from '../../common/custom-datepicker/custom-datepicker';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { TableCellDirective } from '../../common/custom-table/types/table-cell.directive';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { TableColumn } from '../../common/custom-table/types/table-column.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    CustomCard,
    CustomDropdown,
    CustomDatepicker,
    CustomTable,
    CustomPagination,
    TableCellDirective,
    DatePipe,
],
  templateUrl: './logs-page.html',
  styleUrl: './logs-page.css',
})
/* Principal logs page */
export class LogsPage implements OnInit {

  // Dependencies
  private readonly logService = inject(LogService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Data signals
  readonly logs = signal<Log[]>([]);
  readonly loading = signal(false);
  readonly loadingCatalog = signal(false);
  readonly initialized = signal(false);

  // Pagination
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly size = 10;

  // Catalog options
  readonly actions = signal<{ value: string; label: string }[]>([
    { value: '', label: 'Todas las acciones' }
  ]);

  readonly resourceTypes = signal<{ value: string; label: string }[]>([
    { value: '', label: 'Todos los recursos' }
  ]);

  // Filters
  readonly actionFilterControl = new FormControl('', {
    nonNullable: true
  });

  readonly resourceTypeFilterControl = new FormControl('', {
    nonNullable: true
  });


  readonly fromDateControl = new FormControl('', {
    nonNullable: true
  });

  readonly toDateControl = new FormControl('', {
    nonNullable: true
  });

  readonly sortControl = new FormControl<
    'createdAt' | 'action' | 'actorUsername'
  >('createdAt', { nonNullable: true });

  readonly directionControl = new FormControl<'asc' | 'desc'>(
    'desc',
    { nonNullable: true }
  );

  // Date signals for cross-field min/max
  readonly fromDate = signal('');
  readonly toDate = signal('');

  // Table columns
  readonly logColumns: TableColumn[] = [
    { key: 'createdAt', header: 'Fecha' },
    { key: 'actorUsername', header: 'Usuario' },
    { key: 'actionLabel', header: 'Acción' },
    { key: 'resourceTypeLabel', header: 'Tipo de recurso' },
    { key: 'description', header: 'Detalle' }
  ];

  // Prevent stale requests from overwriting newer results
  private requestVersion = 0;

  // On init
  ngOnInit(): void {
    this.loadCatalog();

    this.actionFilterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.resourceTypeFilterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.fromDateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.fromDate.set(value);
        this.onFilterChange();
      });

    this.toDateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.toDate.set(value);
        this.onFilterChange();
      });

    this.sortControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.directionControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.loadLogs();
  }

  // Load available filter options
  loadCatalog(): void {
    this.loadingCatalog.set(true);

    this.logService.getCatalog()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingCatalog.set(false))
      )
      .subscribe({
        next: catalog => {
          this.actions.set([
            { value: '', label: 'Todas las acciones' },
            ...catalog.actions.map(item => ({
              value: item.code,
              label: item.label
            }))
          ]);

          this.resourceTypes.set([
            { value: '', label: 'Todos los recursos' },
            ...catalog.resourceTypes.map(item => ({
              value: item.code,
              label: item.label
            }))
          ]);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar los filtros.',
            'Error al cargar catálogo'
          );
        }
      });
  }

  // Load logs using the current filters and page
  loadLogs(): void {
    const version = ++this.requestVersion;

    this.loading.set(true);

    this.logService.getLogs({
      page: this.page(),
      size: this.size,
      sortBy: this.sortControl.value,
      direction: this.directionControl.value,
      action: this.actionFilterControl.value || undefined,
      resourceType: this.resourceTypeFilterControl.value || undefined,
      from: this.toApiDate(this.fromDateControl.value, false),
      to: this.toApiDate(this.toDateControl.value, true)
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (version === this.requestVersion) {
            this.loading.set(false);
            this.initialized.set(true);
          }
        })
      )
      .subscribe({
        next: response => {
          if (version !== this.requestVersion) {
            return;
          }

          this.logs.set(response.content);
          this.page.set(response.page);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (error: ErrorResponse) => {
          if (version !== this.requestVersion) {
            return;
          }

          this.toastService.error(
            error.message || 'No fue posible cargar los logs.',
            'Error al cargar logs'
          );
        }
      });
  }

  // Convert date-only values to ISO date-time boundaries.
  // Assumes the datepicker returns YYYY-MM-DD.
  private toApiDate(
    value: string,
    endOfDay: boolean
  ): string | undefined {
    if (!value) {
      return undefined;
    }

    const date = new Date(
      `${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`
    );

    return Number.isNaN(date.getTime())
      ? undefined
      : date.toISOString();
  }

  // Reset pagination when filters change
  private onFilterChange(): void {
    this.page.set(0);
    this.loadLogs();
  }

  // Pagination
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadLogs();
  }

  // Reset all filters
  resetFilters(): void {
    this.actionFilterControl.setValue('');
    this.resourceTypeFilterControl.setValue('');
    this.fromDateControl.setValue('');
    this.toDateControl.setValue('');
    this.sortControl.setValue('createdAt');
    this.directionControl.setValue('desc');
  }
}
