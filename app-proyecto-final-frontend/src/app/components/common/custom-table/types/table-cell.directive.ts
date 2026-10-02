import { Directive, inject, input, TemplateRef } from "@angular/core";



@Directive({
    selector: '[appTableCell]',
    standalone: true
})
/*Directive to mark a custom cell template for a given column key */
export class TableCellDirective {

    appTableCell = input.required<string>();

    readonly template = inject(TemplateRef<{ $implicit: unknown; row: unknown }>);
}