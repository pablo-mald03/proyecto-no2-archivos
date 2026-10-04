import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  Router,
  RouterOutlet
} from '@angular/router';
import { LandingTopbar } from '../../components/landingpage/landing-topbar/landing-topbar';
import { LandingSection } from '../../components/landingpage/landing-topbar/types/landing.types';
import { LandingFooter } from "../../components/landingpage/landing-footer/landing-footer";
import { LandingMobileTopbar } from "../../components/landingpage/landing-mobile-topbar/landing-mobile-topbar";
import { LandingMobileSidebar } from "../../components/landingpage/landing-mobile-sidebar/landing-mobile-sidebar";
import { AuthState } from '../../stores/auth.state';


@Component({
  selector: 'app-public-layout',

  imports: [
    RouterOutlet,
    LandingTopbar,
    LandingFooter,
    LandingMobileTopbar,
    LandingMobileSidebar
  ],

  templateUrl: './public-layout.html',

  styleUrl: './public-layout.css'
})
/*Publig layout for landing page*/
export class PublicLayout {

  private readonly authState = inject(AuthState);

  private readonly router = inject(Router);

  mobileSidebarOpen = signal(false);

  readonly isAuthenticated = this.authState.isAuthenticated;


  // Principal navigation management
  navigateToSection(
    section: LandingSection
  ): void {

    window.requestAnimationFrame(() => {

      const element =
        document.getElementById(section);

      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    });

  }


  // Navigate to login
  login(): void {

    this.router.navigate([
      '/auth/login'
    ]);

  }


  // Navigate to dashboard
  goToPortal(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  // Method to toggle the sidebar at mobiles
  toggleMobileSidebar(): void {

    this.mobileSidebarOpen.update(
      open => !open
    );

  }


  // Method to close the sidebar at mobiles
  closeMobileSidebar(): void {

    this.mobileSidebarOpen.set(false);

  }

}