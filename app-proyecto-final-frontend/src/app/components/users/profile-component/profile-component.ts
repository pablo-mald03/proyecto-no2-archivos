import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideAtSign, lucideCake, lucideCheck, lucideCircleCheck, lucideCircleX, lucideIdCard, lucideMail, lucidePhone, lucideShield, lucideUser } from '@ng-icons/lucide';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { Router } from '@angular/router';
import { UserService } from '../../../features/users/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserProfile } from '../../../features/users/models/user-profile.model';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [NgIcon, DatePipe, CustomCard, CustomAlert],
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

  //Initials for the avatar
  readonly initials = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.name[0] ?? ''}${p.firstName[0] ?? ''}`.toUpperCase();
  });

  //Full name
  readonly fullName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.name} ${p.firstName}`;
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

  //Go back method
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}