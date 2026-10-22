import { Component, input, output } from '@angular/core';
import { IconType, NgIcon } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-report-widget-frame',
  standalone: true,
  host: { class: 'block h-full' },
  imports: [NgIcon],
  templateUrl: './report-widget-frame.html',
  styleUrl: './report-widget-frame.css',
})
/*Common frame of the dashboard report widgets component */
export class ReportWidgetFrame {

  // Inputs
  title = input.required<string>();
  subtitle = input('');
  icon = input.required<IconType>();
  iconClass = input('bg-primary/15 text-primary');
  loading = input(false);
  empty = input(false);
  emptyMessage = input('No hay datos para mostrar.');
  showViewMore = input(false);

  // Outputs
  viewMore = output<void>();

  readonly lucideArrowRightIcon = lucideArrowRight;
  readonly skeletonRows = [0, 1, 2, 3, 4];
}
