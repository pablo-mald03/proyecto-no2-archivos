import {
  Component,
  computed,
  input,
  signal
} from '@angular/core';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  IconType,
  NgIcon,
  provideIcons
} from '@ng-icons/core';

import {

  lucideEye,
  lucideEyeOff,
  lucideX
} from '@ng-icons/lucide';

import {
  FieldType
} from './types/textfield.types';

@Component({
  selector: 'app-custom-textfield',

  imports: [
    ReactiveFormsModule,
    NgIcon
  ],

  providers: [
    provideIcons({
      lucideEye,
      lucideEyeOff,
      lucideX
    })
  ],

  templateUrl: './custom-textfield.html',
  styleUrl: './custom-textfield.css',
})

/**
 * Principal textfield component
*/
export class CustomTextfield {

  //ICONS
  readonly lucideXIcon = lucideX;
  readonly lucideEyeOffIcon = lucideEyeOff;
  readonly lucideEyeIcon = lucideEye;

  //PROPS
  label = input('');

  placeholder = input('');

  type = input<FieldType>('text');

  control = input.required<FormControl>();

  hint = input('');

  icon = input<IconType>();

  clearable = input(false);

  readonly = input(false);

  size = input<'sm' | 'md' | 'lg'>('md');

  min = input<number>();
  max = input<number>();
  step = input(1);


  readonly showPassword = signal(false);

  readonly isNumber = computed(() => {
    return this.type() === 'number';
  });

  get numericValue(): number {
    return Number(this.control().value) || 0;
  }


  //Method to validate if is the password parameter setted
  readonly isPassword = computed(() => {
    return this.type() === 'password';
  });


  //Method to validate the field type
  readonly fieldType = computed(() => {

    if (
      this.isPassword()
      && this.showPassword()
    ) {
      return 'text';
    }

    return this.type();

  });


  //Method to know if the user has errors at the inputs

  get hasError(): boolean {
    const control = this.control();
    return control.invalid && (control.touched || control.dirty);
  }

  //Method to detect the error
  get errorMessage(): string {
    const errors = this.control().errors;

    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Campo obligatorio';
    }

    if (errors['email']) {
      return 'Correo inválido';
    }

    if (errors['invalidPhone']) {
      return 'El formato del teléfono no es válido';
    }

    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    if (errors['invalidPriceRange']) {
      return 'El precio hasta debe ser mayor o igual al precio desde';
    }

    if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `El valor máximo es ${errors['max'].max}`;
    }

    if (errors['invalidFolderName']) {
      return 'El nombre de la carpeta no debe incluir extensiones';
    }

    if (errors['invalidCharacters']) {
      return 'El nombre contiene caracteres no permitidos (\\ / : * ? " < > |)';
    }

    if (errors['invalidExtension']) {
      return typeof errors['invalidExtension'] === 'string'
        ? errors['invalidExtension']
        : 'El archivo debe conservar una extensión válida (.txt o .md)';
    }

    return 'Valor inválido';
  }

  //Principal clearable method
  clear(): void {
    this.control().setValue('');
    this.control().markAsDirty();
  }

  //Togle password  method
  togglePassword(): void {

    this.showPassword.update(
      value => !value
    );
  }

  //Method to increment the option
  increment(): void {
    const control = this.control();
    const value = Number(control.value) || 0;
    const nextValue = value + this.step();

    if (
      this.max() !== undefined
      && nextValue > this.max()!
    ) {
      return;
    }

    control.setValue(nextValue);
    control.markAsDirty();
  }

  //Method to decrement the option
  decrement(): void {
    const control = this.control();
    const value = Number(control.value) || 0;
    const nextValue = value - this.step();

    if (
      this.min() !== undefined
      && nextValue < this.min()!
    ) {
      return;
    }

    control.setValue(nextValue);
    control.markAsDirty();
  }
}