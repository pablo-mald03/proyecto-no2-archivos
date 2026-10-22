import { Component, input, output } from '@angular/core';
import { IconType, NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeftRight, lucideArrowRight, lucideBoxes, lucideCalendarClock, lucideChartBarBig } from '@ng-icons/lucide';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [RouterLink, NgIcon, CustomCard],
  templateUrl: './report-card.html',
  styleUrl: './report-card.css',
})

/*Principal report card */
export class ReportCard {

  readonly lucideArrowRightIcon = lucideArrowRight;

  // Inputs
  title = input.required<string>();
  description = input.required<string>();
  icon = input.required<IconType>();
  accentClass = input.required<string>();
  route = input.required<string>();
  disabled = input(false);
}