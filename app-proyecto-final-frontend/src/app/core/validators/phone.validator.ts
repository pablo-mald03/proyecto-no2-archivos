import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/*Principal validator for phone fields */
export function phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        const phonePattern = /^\+?[0-9\s\-\(\)]{8,20}$/;

        return phonePattern.test(control.value)
            ? null
            : { invalidPhone: true };
    };
}