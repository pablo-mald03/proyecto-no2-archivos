import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDatepicker } from '../../common/custom-datepicker/custom-datepicker';
import { CustomTable } from '../../common/custom-table/custom-table';
import { TableCellDirective } from '../../common/custom-table/types/table-cell.directive';
import { CustomPagination } from '../../common/custom-pagination/custom-pagination';
import { ActivityService } from '../../../features/activity/service/activity.service';
import { ToastService } from '../../../core/services/toast.service';
import { Log } from '../../../features/logs/models/log.model';
import { TableColumn } from '../../common/custom-table/types/table-column.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ActivityQuery } from '../../../features/activity/models/activity-query.model';

@Component({
  selector: 'app-user-activity-page',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    CustomCard,
    CustomDropdown,
    CustomTextfield,
    CustomDatepicker,
    CustomTable,
    TableCellDirective,
    CustomPagination
  ],
  templateUrl: './user-activity-page.html',
  styleUrl: './user-activity-page.css',
})
//User activity page component
export class UserActivityPage implements OnInit {

  // Dependencies injection
  private readonly activityService = inject(ActivityService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Data state signals
  readonly logs = signal<Log[]>([]);
  readonly loading = signal(false);
  readonly loadingCatalog = signal(false);
  readonly initialized = signal(false);

  // Pagination signals
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly size = 10;

  // Catalog filter options signals
  readonly actions = signal<{ value: string; label: string }[]>([
    { value: '', label: 'Todas las acciones' }
  ]);

  readonly resourceTypes = signal<{ value: string; label: string }[]>([
    { value: '', label: 'Todos los recursos' }
  ]);

  // Form controls for filters
  readonly actionFilterControl = new FormControl('', { nonNullable: true });
  readonly resourceTypeFilterControl = new FormControl('', { nonNullable: true });
  readonly resourceIdFilterControl = new FormControl('', { nonNullable: true });
  readonly fromDateControl = new FormControl('', { nonNullable: true });
  readonly toDateControl = new FormControl('', { nonNullable: true });

  readonly sortControl = new FormControl<'createdAt' | 'action'>('createdAt', { nonNullable: true });
  readonly directionControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });

  // Date cross-field signals
  readonly fromDate = signal('');
  readonly toDate = signal('');

  // Table columns tailored for user activity
  readonly logColumns: TableColumn[] = [
    { key: 'createdAt', header: 'Fecha' },
    { key: 'actionLabel', header: 'Acción' },
    { key: 'resourceName', header: 'Recurso' },
    { key: 'resourceTypeLabel', header: 'Tipo' },
    { key: 'description', header: 'Detalle' }
  ];

  // Request race condition prevention
  private requestVersion = 0;

  ngOnInit(): void {
    this.loadCatalog();
    this.setupFilterListeners();
    this.loadUserActivity();
  }

  // Bind form control changes to refetch activity logs
  private setupFilterListeners(): void {
    this.actionFilterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.resourceTypeFilterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    this.resourceIdFilterControl.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
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
  }

  // Load action and resource type catalogs
  loadCatalog(): void {
    this.loadingCatalog.set(true);

    this.activityService.getCatalog()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingCatalog.set(false))
      )
      .subscribe({
        next: catalog => {
          this.actions.set([
            { value: '', label: 'Todas las acciones' },
            ...catalog.actions.map(item => ({ value: item.code, label: item.label }))
          ]);

          this.resourceTypes.set([
            { value: '', label: 'Todos los recursos' },
            ...catalog.resourceTypes.map(item => ({ value: item.code, label: item.label }))
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

  // Load user specific activity logs
  loadUserActivity(): void {
    const version = ++this.requestVersion;
    this.loading.set(true);

    const queryParams: ActivityQuery = {
      page: this.page(),
      size: this.size,
      sortBy: this.sortControl.value,
      direction: this.directionControl.value,
      action: this.actionFilterControl.value || undefined,
      resourceType: this.resourceTypeFilterControl.value || undefined,
      resourceId: this.resourceIdFilterControl.value.trim() || undefined,
      from: this.toApiDate(this.fromDateControl.value, false),
      to: this.toApiDate(this.toDateControl.value, true)
    };

    this.activityService.getMyActivity(queryParams)
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
          if (version !== this.requestVersion) return;

          this.logs.set(response.content);
          this.page.set(response.page);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (error: ErrorResponse) => {
          if (version !== this.requestVersion) return;

          this.toastService.error(
            error.message || 'No fue posible consultar tu historial de actividad.',
            'Error de actividad'
          );
        }
      });
  }

  // Convert date picker string (YYYY-MM-DD) to ISO Date Time
  private toApiDate(value: string, endOfDay: boolean): string | undefined {
    if (!value) return undefined;

    const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  // Reset pagination when filter criteria changes
  private onFilterChange(): void {
    this.page.set(0);
    this.loadUserActivity();
  }

  // Handle page navigation
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadUserActivity();
  }

  // Reset all filter controls
  resetFilters(): void {
    this.actionFilterControl.setValue('');
    this.resourceTypeFilterControl.setValue('');
    this.resourceIdFilterControl.setValue('');
    this.fromDateControl.setValue('');
    this.toDateControl.setValue('');
    this.sortControl.setValue('createdAt');
    this.directionControl.setValue('desc');
  }
}