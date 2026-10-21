import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCalendarRange, lucideChartBarBig, lucidePackage, lucideTruck } from '@ng-icons/lucide';
import { ReportCard } from '../../reports/report-card/report-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { AuthState } from '../../../stores/auth.state';
import { Router } from '@angular/router';
import { REPORT_SHARING } from '../../reports/report-card/types/report-card-model';

@Component({
  selector: 'app-report-shared-page',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, ReportCard, CustomAlert],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideChartBarBig,
      lucideTruck,
      lucidePackage,
      lucideCalendarRange
    })
  ],
  templateUrl: './report-shared-page.html',
  styleUrl: './report-shared-page.css',
})
/*Principal purchase reports landing page */
export class ReportSharedPage {

  //Dependencies
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  readonly lucideArrowLeftIcon = lucideArrowLeft;

  readonly sections = computed(() =>
    REPORT_SHARING.filter(s =>
      this.authState.hasPermission(s.permission)
    )
  );

  //Method to go back
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}