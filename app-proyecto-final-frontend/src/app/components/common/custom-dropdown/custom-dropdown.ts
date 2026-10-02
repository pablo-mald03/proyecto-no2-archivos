import {
  Component,
  computed,
  effect,
  input
} from '@angular/core';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  IconType,
  NgIcon
} from '@ng-icons/core';

import {
  lucideChevronDown,
  lucideX
} from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-dropdown',

  imports: [
    ReactiveFormsModule,
    NgIcon
  ],

  templateUrl: './custom-dropdown.html',
  styleUrl: './custom-dropdown.css'
})
/*Custom dropdown component */
export class CustomDropdown {

  readonly lucideXIcon = lucideX;
  readonly lucideChevronDownIcon = lucideChevronDown;

  label = input('');

  placeholder = input('Selecciona una opción');

  options = input.required<Record<string, unknown>[]>();

  optionKey = input.required<string>();

  optionLabel = input.required<string>();

  control = input.required<FormControl>();

  icon = input<IconType>();

  clearable = input(false);

  selectableFirst = input(false);


  private firstOptionInitialized = false;


  constructor() {

    effect(() => {

      const options = this.options();

      if (
        !this.selectableFirst()
        || !options.length
        || this.firstOptionInitialized
      ) {
        return;
      }

      const control = this.control();

      if (
        control.value === null
        || control.value === undefined
        || control.value === ''
      ) {

        control.setValue(
          this.getOptionValue(options[0])
        );

      }

      this.firstOptionInitialized = true;

    });

  }


  readonly hasError = computed(() => {

    const control = this.control();

    return control.invalid
      && (control.touched || control.dirty);

  });


  readonly errorMessage = computed(() => {

    const errors = this.control().errors;

    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Selecciona una opción';
    }

    return 'Valor inválido';

  });


  getOptionValue(option: Record<string, unknown>): unknown {

    return option[this.optionKey()];

  }


  getOptionLabel(option: Record<string, unknown>): string {

    return String(
      option[this.optionLabel()] ?? ''
    );

  }


  //Clear method
  clear(): void {
    this.control().reset();
  }

}