import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/* Principal validator for folder and files names  */
export function driveNameValidator(itemType: 'folder' | 'file'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return null; 

    const invalidCharsRegex = /[\\/:*?"<>|]/;
    if (invalidCharsRegex.test(value)) {
      return { invalidCharacters: true };
    }

    if (itemType === 'file') {
      const validExtensionRegex = /\.(txt|md)$/i;
      if (!validExtensionRegex.test(value)) {
        return { invalidExtension: 'El archivo debe conservar la extensión (.txt o .md)' };
      }
    }

    return null;
  };
}