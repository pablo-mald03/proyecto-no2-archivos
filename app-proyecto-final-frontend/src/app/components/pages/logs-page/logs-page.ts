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
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';

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
    DatePipe
  ],
  templateUrl: './logs-page.html',
  styleUrl: './logs-page.css',
})
/*Principal logs page */
export class LogsPage implements OnInit {

  //Dependencies
  private readonly logService = inject(LogService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  //Data signals
  readonly logs = signal<Log[]>([]);
  readonly loading = signal(false);
  readonly loadingModules = signal(false);

  //Pagination signals
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly size = 10;

  //Modules for the dropdown
  readonly modules = signal<{ value: string; label: string }[]>([]);

  //Filters
  readonly moduleFilterControl = new FormControl('', { nonNullable: true });
  readonly fromDateControl = new FormControl('', { nonNullable: true });
  readonly toDateControl = new FormControl('', { nonNullable: true });

  //Mirrors de las fechas en signal, para poder bindear min/max cruzado en el template
  readonly fromDate = signal('');
  readonly toDate = signal('');

  //Table columns
  readonly logColumns: TableColumn[] = [
    { key: 'module', header: 'Módulo' },
    { key: 'action', header: 'Acción' },
    { key: 'detail', header: 'Detalle' },
    { key: 'userRegistry', header: 'Usuario' },
    { key: 'createdAt', header: 'Fecha', align: 'right' }
  ];

  //On init actions
  ngOnInit(): void {
    this.loadModules();
    this.loadLogs();

    this.moduleFilterControl.valueChanges
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
  }

  //Load available modules
  loadModules(): void {
    this.loadingModules.set(true);

    this.logService.getModules().pipe(
      finalize(() => this.loadingModules.set(false))
    ).subscribe({
      next: (modules) => {
        this.modules.set([
          { value: '', label: 'Todos los módulos' },
          ...modules.map(module => ({ value: module, label: module }))
        ]);
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cargar los módulos.',
          'Error al cargar módulos'
        );
      }
    });
  }

  //Load logs with current filters and page
  loadLogs(): void {
    this.loading.set(true);

    this.logService.getLogs({
      page: this.page(),
      size: this.size,
      sortBy: 'createdAt',
      direction: 'DESC',
      module: this.moduleFilterControl.value || undefined,
      createdFrom: this.fromDateControl.value || undefined,
      createdTo: this.toDateControl.value || undefined
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response) => {
        this.logs.set(response.logs);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No fue posible cargar los logs.',
          'Error al cargar logs'
        );
      }
    });
  }

  //Any filter change resets to the first page
  private onFilterChange(): void {
    this.page.set(0);
    this.loadLogs();
  }

  //Pagination change
  onPageChange(page: number): void {
    this.page.set(page);
    this.loadLogs();
  }

}