import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideArrowLeftRight, lucideBoxes, lucideCalendarClock, lucideChartBarBig } from '@ng-icons/lucide';
import { ReportCard } from '../../reports/report-card/report-card';
import { REPORT_USERS } from '../../reports/report-card/types/report-card-model';
import { Router } from '@angular/router';
import { AuthState } from '../../../stores/auth.state';
import { CustomAlert } from '../../common/custom-alert/custom-alert';

@Component({
  selector: 'app-report-users-page',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, ReportCard, CustomAlert],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideChartBarBig,
      lucideBoxes,
      lucideArrowLeftRight,
      lucideCalendarClock
    })
  ],
  templateUrl: './report-users-page.html',
  styleUrl: './report-users-page.css',
})
export class ReportUsersPage {

  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  readonly lucideArrowLeftIcon = lucideArrowLeft;

  readonly sections = computed(() =>
    REPORT_USERS.filter(s =>
      this.authState.hasPermission(s.permission)
    )
  );

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}