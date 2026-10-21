import { Component, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowUpDown, lucideFilter, lucideRotateCcw, lucideSearch, lucideX } from '@ng-icons/lucide';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ReportSharesQueryParams } from '../../../features/report-shares/models/query/report-share-query-param.model';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomDatepicker } from '../../common/custom-datepicker/custom-datepicker';
import { CustomButton } from '../../common/custom-button/custom-button';

@Component({
  selector: 'app-report-shares-filter-bar-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIconComponent,
    CustomTextfield,
    CustomDropdown,
    CustomDatepicker,
    CustomButton
  ],
  providers: [provideIcons({ lucideSearch, lucideFilter, lucideArrowUpDown, lucideX })], templateUrl: './report-shares-filter-bar-component.html',
  styleUrl: './report-shares-filter-bar-component.css',
})
/* Filter bar for shares reports using custom UI components */
export class ReportSharesFilterBarComponent implements OnInit {

  // OUTPUTS
  readonly filterChange = output<ReportSharesQueryParams>();

  // CONTROLS
  readonly searchCtrl = new FormControl('');
  readonly resourceTypeCtrl = new FormControl('');
  readonly directionCtrl = new FormControl<'asc' | 'desc'>('desc');
  readonly dateFromCtrl = new FormControl('');
  readonly dateToCtrl = new FormControl('');

  readonly lucideRotateCcwIcon = lucideRotateCcw;

  // DROPDOWN OPTIONS
  readonly resourceTypeOptions = [
    { key: '', label: 'Todos los recursos' },
    { key: 'FILE', label: 'Solo Archivos' },
    { key: 'FOLDER', label: 'Solo Carpetas' }
  ];

  readonly directionOptions = [
    { key: 'desc', label: 'Más compartidos primero' },
    { key: 'asc', label: 'Menos compartidos primero' }
  ];

  readonly lucideFilterIcon = lucideFilter;

  ngOnInit(): void {
    // Search control with debounce
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.emitFilters());

    // Instant filter changes
    this.resourceTypeCtrl.valueChanges.subscribe(() => this.emitFilters());
    this.directionCtrl.valueChanges.subscribe(() => this.emitFilters());
    this.dateFromCtrl.valueChanges.subscribe(() => this.emitFilters());
    this.dateToCtrl.valueChanges.subscribe(() => this.emitFilters());
  }

  // Method to check if any filter is active
  get hasActiveFilters(): boolean {
    return !!(
      this.searchCtrl.value ||
      this.resourceTypeCtrl.value ||
      this.directionCtrl.value !== 'desc' ||
      this.dateFromCtrl.value ||
      this.dateToCtrl.value
    );
  }

  // Method to reset all filters to their default state
  resetFilters(): void {
    this.searchCtrl.setValue('', { emitEvent: false });
    this.resourceTypeCtrl.setValue('', { emitEvent: false });
    this.directionCtrl.setValue('desc', { emitEvent: false });
    this.dateFromCtrl.setValue('', { emitEvent: false });
    this.dateToCtrl.setValue('', { emitEvent: false });
    this.emitFilters();
  }

  // Method to emit active filters
  private emitFilters(): void {
    this.filterChange.emit({
      search: this.searchCtrl.value || undefined,
      resourceType: (this.resourceTypeCtrl.value as 'FILE' | 'FOLDER') || undefined,
      direction: this.directionCtrl.value || 'desc',
      dateFrom: this.dateFromCtrl.value || undefined,
      dateTo: this.dateToCtrl.value || undefined
    });
  }
}