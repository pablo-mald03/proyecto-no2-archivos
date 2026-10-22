import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { lucideCalendarDays, lucideX } from '@ng-icons/lucide';
import { type DatepickerSize } from './constants/date-picker.constant';

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './custom-datepicker.html',
  styleUrl: './custom-datepicker.css',
})
/*Custom date picker component */
export class CustomDatepicker {
  // PROPS
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

  size = input<DatepickerSize>('md');

  readonly lucideCalendarIcon = lucideCalendarDays;
  readonly lucideXIcon = lucideX;

  readonly hasValue = computed(() => !!this.control().value);

  readonly sizeConfig = computed(() => {
    switch (this.size()) {
      case 'sm':
        return {
          label: 'text-xs mb-1',
          input: 'px-2.5 py-1 text-xs rounded-lg',
          inputPlWithIcon: 'pl-8',
          inputPrWithClear: 'pr-7',
          leftIconPos: 'left-2.5',
          leftIconSize: '14',
          clearBtnPos: 'right-1.5 p-0.5',
          clearIconSize: '12',
          helperText: 'mt-0.5 text-xs',
        };
      case 'lg':
        return {
          label: 'text-sm mb-2',
          input: 'px-4 py-3 text-base rounded-xl',
          inputPlWithIcon: 'pl-11',
          inputPrWithClear: 'pr-11',
          leftIconPos: 'left-3.5',
          leftIconSize: '20',
          clearBtnPos: 'right-3 p-1.5',
          clearIconSize: '16',
          helperText: 'mt-1.5 text-sm',
        };
      default: // 'md'
        return {
          label: 'text-sm mb-1.5',
          input: 'px-3.5 py-2 text-sm rounded-xl',
          inputPlWithIcon: 'pl-9.5',
          inputPrWithClear: 'pr-9',
          leftIconPos: 'left-3',
          leftIconSize: '16',
          clearBtnPos: 'right-2 p-1',
          clearIconSize: '14',
          helperText: 'mt-1 text-xs',
        };
    }
  });

  get hasError(): boolean {
    const control = this.control();
    return control.invalid && (control.touched || control.dirty);
  }

  get errorMessage(): string {
    const errors = this.control().errors;

    if (!errors) return '';
    if (errors['required']) return 'Campo obligatorio';
    if (errors['min']) return 'La fecha es demasiado antigua';
    if (errors['max']) return 'La fecha es demasiado reciente';

    return 'Fecha inválida';
  }

  openPicker(event: MouseEvent): void {
    if (!this.openOnClick() || this.disabled()) return;

    const target = event.currentTarget as HTMLInputElement;
    if (typeof target.showPicker === 'function') {
      target.showPicker();
    }
  }

  clear(): void {
    this.control().setValue('');
    this.control().markAsTouched();
  }
}