import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideAtSign, lucideCake, lucideCalendar, lucideCheck, lucideChevronRight, lucideCircleCheck, lucideCircleX, lucideHardDrive, lucideIdCard, lucideKeyRound, lucideMail, lucidePhone, lucideShield, lucideShieldCheck, lucideUser, lucideUserPen } from '@ng-icons/lucide';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { Router } from '@angular/router';
import { UserService } from '../../../features/users/service/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { AuthState } from '../../../stores/auth.state';
import { UserProfile } from '../../../features/users/models/response/user-profile.model';
import { EditProfileModalComponent } from '../edit-profile-modal-component/edit-profile-modal-component';
import { ChangePasswordModalComponent } from '../change-password-modal-component/change-password-modal-component';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, CustomCard, CustomAlert, DatePipe, EditProfileModalComponent, ChangePasswordModalComponent],
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

  // Dependencies
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);

  // Data Signals
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(false);

  // Modal Visibility Signals
  readonly showEditProfileModal = signal(false);
  readonly showChangePasswordModal = signal(false);

  // Lucide Icons
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

  // Computed initials for user avatar
  readonly initials = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
  });

  // Computed full name
  readonly fullName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName} ${p.lastName}`;
  });

  // Computed storage usage percentage
  readonly storagePercentage = computed(() => {
    const s = this.profile()?.storage;
    if (!s || s.quotaBytes === 0) return 0;

    const percentage = (s.usedBytes / s.quotaBytes) * 100;
    const rounded = Math.round(percentage * 100) / 100;

    const visible = s.usedBytes > 0 ? Math.max(rounded, 0.01) : rounded;

    return Math.min(visible, 100);
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  // Load user profile details
  loadProfile(): void {
    this.loading.set(true);

    this.userService.getUserProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.profile.set(response),
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'Could not load profile information.',
            'Profile Loading Error'
          );
        }
      });
  }

  // Format bytes into readable human units 
  formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

    if (i <= 0) return `${Math.round(bytes)} Bytes`;

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  // Modal controls
  openEditProfileModal(): void {
    this.showEditProfileModal.set(true);
  }

  closeEditProfileModal(): void {
    this.showEditProfileModal.set(false);
  }

  openChangePasswordModal(): void {
    this.showChangePasswordModal.set(true);
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal.set(false);
  }

  // Handle navigation based on user role
  goBack(): void {
    const user = this.authState.user();
    if (user?.roleCode === 'USER') {
      this.router.navigate(['/drive']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}