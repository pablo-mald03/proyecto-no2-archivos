import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { lucideCalendarDays, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './custom-datepicker.html',
  styleUrl: './custom-datepicker.css',
})
/*Custom date picker component */
export class CustomDatepicker {

  //PROPS
  label = input('');
  placeholder = input('');

  control = input.required<FormControl>();

  hint = input('');

  icon = input<string>();

  clearable = input(false);

  disabled = input(false);

  openOnClick = input(true);

  min = input('');
  max = input('');

  readonly lucideCalendarIcon = lucideCalendarDays;

  readonly lucideXIcon = lucideX;

  readonly hasValue = computed(() => {
    return !!this.control().value;
  });

  //Has errors method flag
  get hasError(): boolean {

    const control = this.control();

    return control.invalid &&
      (control.touched || control.dirty);
  }

  //Check errors method
  get errorMessage(): string {

    const errors = this.control().errors;

    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Campo obligatorio';
    }

    if (errors['min']) {
      return 'La fecha es demasiado antigua';
    }

    if (errors['max']) {
      return 'La fecha es demasiado reciente';
    }

    return 'Fecha inválida';
  }

  //Open picker method
  openPicker(
    event: MouseEvent
  ): void {

    if (!this.openOnClick() || this.disabled()) {
      return;
    }

    const target =
      event.currentTarget as HTMLInputElement;

    if (
      typeof target.showPicker === 'function'
    ) {
      target.showPicker();
    }
  }

  //Clearable method
  clear(): void {

    this.control().setValue('');

    this.control().markAsTouched();
  }
}