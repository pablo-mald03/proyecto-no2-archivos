import {
    AbstractControl,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';

/*Function validator for password */
export function passwordMatchValidator(passwordControlName: string): ValidatorFn {

    return (
        control: AbstractControl
    ): ValidationErrors | null => {

        const passwordControl =
            control.parent?.get(passwordControlName);

        if (
            !passwordControl ||
            !control.value
        ) {
            return null;
        }

        return control.value === passwordControl.value
            ? null
            : {
                passwordMismatch: true
            };

    };

}