import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideAtSign, lucideCake, lucideCalendar, lucideCheck, lucideChevronRight, lucideCircleCheck, lucideCircleX, lucideHardDrive, lucideIdCard, lucideKeyRound, lucideMail, lucidePhone, lucideShield, lucideShieldCheck, lucideUser, lucideUserPen } from '@ng-icons/lucide';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { Router } from '@angular/router';
import { UserService } from '../../../features/users/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { AuthState } from '../../../stores/auth.state';
import { UserProfile } from '../../../features/users/models/response/user-profile.model';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, CustomCard, CustomAlert,DatePipe],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideMail,
      lucidePhone,
      lucideCake,
      lucideIdCard,
      lucideAtSign,
      lucideShield,
      lucideCircleCheck,
      lucideCircleX,
      lucideUser
    })
  ],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
//Profile component
export class ProfileComponent implements OnInit {

  //Dependencies
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  //Data
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(false);

  private readonly authState = inject(AuthState);

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;
  readonly lucideMailIcon = lucideMail;
  readonly lucidePhoneIcon = lucidePhone;
  readonly lucideCakeIcon = lucideCake;
  readonly lucideIdCardIcon = lucideIdCard;
  readonly lucideAtSignIcon = lucideAtSign;
  readonly lucideShieldIcon = lucideShield;
  readonly lucideCheckIcon = lucideCircleCheck;
  readonly lucideXIcon = lucideCircleX;
  readonly lucideUserIcon = lucideUser;
  readonly lucideShieldCheckIcon = lucideShieldCheck;
  readonly lucideUserEditIcon = lucideUserPen;
  readonly lucideKeyRoundIcon = lucideKeyRound;
  readonly lucideChevronRightIcon = lucideChevronRight;
  readonly lucideCalendarIcon = lucideCalendar;
  readonly lucideHardDriveIcon = lucideHardDrive;

  // Iniciales del Avatar basadas en firstName y lastName
  readonly initials = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
  });

  // Nombre completo
  readonly fullName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName} ${p.lastName}`;
  });

  // Porcentaje de almacenamiento usado
  readonly storagePercentage = computed(() => {
    const s = this.profile()?.storage;
    if (!s || s.quotaBytes === 0) return 0;
    const percentage = (s.usedBytes / s.quotaBytes) * 100;
    return Math.min(Math.round(percentage), 100);
  });


  ngOnInit(): void {
    this.loadProfile();
  }

  //Load profile method
  loadProfile(): void {
    this.loading.set(true);

    this.userService.getUserProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.profile.set(response),
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar el perfil.',
            'Error al cargar perfil'
          );
        }
      });
  }

  // Formateador limpio de bytes a MB o GB
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  openEditProfileModal(): void {

  }

  openChangePasswordModal(): void {

  }


  //Go back method
  goBack(): void {
    const user = this.authState.user();
    if (user?.roleCode === 'USER') {
      this.router.navigate(['/drive']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}