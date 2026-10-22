import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowRight, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-report-shares-id-search',
  standalone: true,
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './report-shares-id-search.html',
  styleUrl: './report-shares-id-search.css',
})
/*Input to query a report by a user id */
export class ReportSharesIdSearch {

  // Inputs
  label = input.required<string>();
  placeholder = input('');
  buttonLabel = input('Consultar');
  loading = input(false);

  // Outputs
  submitted = output<string>();

  readonly control = new FormControl('', { nonNullable: true });

  //Icons
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideArrowRightIcon = lucideArrowRight;

  //Method to emit the trimmed id
  submit(): void {
    const value = this.control.value.trim();
    if (value) this.submitted.emit(value);
  }
}
