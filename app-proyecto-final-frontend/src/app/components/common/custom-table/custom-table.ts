import { Component, computed, contentChildren, input } from '@angular/core';
import { TableColumn, TableVariant } from './types/table-column.model';
import { TableCellDirective } from './types/table-cell.directive';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  host: { class: 'block w-full' },
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
})
/*Principal reusable table component */
export class CustomTable<T> {

  //Props
  columns = input.required<TableColumn[]>();

  data = input.required<T[]>();

  loading = input(false);

  hoverable = input(false);

  striped = input(false);

  numbered = input(false);

  //Base index for the "No." column
  startIndex = input(0);

  //variants
  headerVariant = input<TableVariant>('primary');

  emptyMessage = input('No hay datos para mostrar.');

  //Custom cell templates projected from the parent, indexados por column key
  private readonly cellDirectives = contentChildren(TableCellDirective);

  readonly cellTemplates = computed(() => {

    const map = new Map<string, TableCellDirective['template']>();

    this.cellDirectives().forEach(directive => {
      map.set(directive.appTableCell(), directive.template);
    });

    return map;
  });

  //Total columns (Enumeration allowed)
  readonly totalColumns = computed(() =>
    this.columns().length + (this.numbered() ? 1 : 0)
  );

  //Method to get the plain value of a cell (Fallback)
  getValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }
}