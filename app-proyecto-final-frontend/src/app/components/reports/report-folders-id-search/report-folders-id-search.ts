import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { lucideArrowRight, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-report-folders-id-search',
  standalone: true,
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './report-folders-id-search.html',
  styleUrl: './report-folders-id-search.css',
})
/*Input component to query a report by an id */
export class ReportFoldersIdSearch {

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

  //Emit the trimmed id
  submit(): void {
    const value = this.control.value.trim();
    if (value) this.submitted.emit(value);
  }
}
