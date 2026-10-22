import { Component, DestroyRef, inject, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { lucideRotateCcw, lucideSearch } from '@ng-icons/lucide';
import { debounceTime } from 'rxjs';
import { TopUsersReportParams } from '../../../features/report-users/models/request/top-users-report-params.model';

@Component({
  selector: 'app-report-users-top-filters',
  standalone: true,
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './report-users-top-filters.html',
  styleUrl: './report-users-top-filters.css',
})
/*Filters (search and date range) of the top users reports */
export class ReportUsersTopFilters implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  // Outputs
  filtersChange = output<TopUsersReportParams>();

  //Form
  readonly form = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    dateFrom: new FormControl('', { nonNullable: true }),
    dateTo: new FormControl('', { nonNullable: true })
  });

  //Icons
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideResetIcon = lucideRotateCcw;

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filtersChange.emit(this.buildParams()));
  }

  //Is there any active filter
  hasFilters(): boolean {
    const { search, dateFrom, dateTo } = this.form.getRawValue();
    return !!(search.trim() || dateFrom || dateTo);
  }

  //Clear all the filters
  reset(): void {
    this.form.reset();
  }

  //Build the query params from the form
  private buildParams(): TopUsersReportParams {
    const { search, dateFrom, dateTo } = this.form.getRawValue();

    return {
      search: search.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    };
  }
}
