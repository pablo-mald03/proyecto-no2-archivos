import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/*Validator for price ranged */
export function priceRangeValidator(
  minControl: FormControl<number | null>
): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const minValue = minControl.value;
    const maxValue = control.value;

    if (
      minValue === null
      || maxValue === null
    ) {
      return null;
    }

    return maxValue >= minValue
      ? null
      : { invalidPriceRange: true };
  };
}