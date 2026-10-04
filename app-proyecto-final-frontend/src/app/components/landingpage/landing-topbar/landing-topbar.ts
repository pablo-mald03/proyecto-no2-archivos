import { Component, input, output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { lucideLayoutDashboard, lucideLogIn } from '@ng-icons/lucide';
import { LandingSection } from './types/landing.types';

@Component({
  selector: 'app-landing-topbar',

  imports: [
    CustomButton
  ],

  providers: [
    provideIcons({
      lucideLogIn
    })
  ],

  templateUrl: './landing-topbar.html',

  styleUrl: './landing-topbar.css'
})
/*
 * Landing topbar  
*/
export class LandingTopbar {

  //Icons
  readonly lucideLogInIcon = lucideLogIn;

  readonly lucidePortalIcon = lucideLayoutDashboard;


  isAuthenticated =
    input(false);


  sectionSelected =
    output<LandingSection>();

  loginClicked =
    output<void>();

  portalClicked =
    output<void>();


  selectSection(
    section: LandingSection
  ): void {

    this.sectionSelected.emit(section);

  }


  //Signal to go to the login
  login(): void {

    this.loginClicked.emit();

  }


  //Signal to go to the portal
  goToPortal(): void {

    this.portalClicked.emit();

  }

}