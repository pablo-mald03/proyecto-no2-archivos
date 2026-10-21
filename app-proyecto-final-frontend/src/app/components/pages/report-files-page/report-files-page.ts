import { Component, computed, inject } from '@angular/core';
import { ReportCard } from '../../reports/report-card/report-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { NgIconComponent } from '@ng-icons/core';
import { REPORT_FOLDERS } from '../../reports/report-card/types/report-card-model';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { AuthState } from '../../../stores/auth.state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-files-page',
  imports: [ReportCard, CustomAlert, NgIconComponent],
  templateUrl: './report-files-page.html',
  styleUrl: './report-files-page.css',
})
//Report sale page
export class ReportFilesPage {

  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  readonly lucideArrowLeftIcon = lucideArrowLeft;

  readonly sections = computed(() =>
    REPORT_FOLDERS.filter(s =>
      this.authState.hasPermission(s.permission)
    )
  );

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}