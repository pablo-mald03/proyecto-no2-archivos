import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { lucideLayoutDashboard, lucideLogIn, lucideMenu } from '@ng-icons/lucide';

@Component({
  selector: 'app-landing-mobile-topbar',
  imports: [
    NgIcon,
    CustomButton
  ],
  providers: [
    provideIcons({
      lucideMenu,
      lucideLogIn
    })
  ],
  templateUrl: './landing-mobile-topbar.html',
  styleUrl: './landing-mobile-topbar.css'
})
export class LandingMobileTopbar {

  // Icons
  readonly lucideLogInIcon = lucideLogIn;

  readonly lucidePortalIcon = lucideLayoutDashboard;

  readonly lucideMenuIcon = lucideMenu;


  // Props
  isAuthenticated = input(false);


  // Outputs
  menuToggle = output<void>();

  loginClicked = output<void>();

  portalClicked = output<void>();


  /* Method to open the menu bar */
  openMenu(): void {

    this.menuToggle.emit();

  }


  /* Method to go to the login */
  login(): void {

    this.loginClicked.emit();

  }


  /* Method to go to the portal */
  goToPortal(): void {

    this.portalClicked.emit();

  }

}