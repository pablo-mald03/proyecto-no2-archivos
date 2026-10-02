import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-text-area',
  imports: [
    ReactiveFormsModule,
    NgIcon
  ],

  providers: [
    provideIcons({
      lucideX
    })
  ],
  templateUrl: './custom-text-area.html',
  styleUrl: './custom-text-area.css',
})
/**
 * Principal textarea component
*/
export class CustomTextarea {

  //ICONS
  readonly lucideXIcon = lucideX;

  //PROPS
  label = input('');

  placeholder = input('');

  control = input.required<FormControl>();

  hint = input('');

  clearable = input(false);

  rows = input(4);

  resizable = input(false);


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

    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }

    return 'Valor inválido';
  }

  //Principal clearable method
  clear(): void {

    this.control().setValue('');

  }

}