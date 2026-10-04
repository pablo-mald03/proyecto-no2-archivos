import { Component, inject, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChartNoAxesCombined,
  lucideShieldCheck,
  lucideGauge,
  lucideUsers,
  lucidePackageCheck,
  lucideLogIn,
  lucideLayoutDashboard
} from '@ng-icons/lucide';
import { Commitment } from './types/landing.commitients';
import { CustomButton } from "../../common/custom-button/custom-button";
import { Router } from '@angular/router';
import { AuthState } from '../../../stores/auth.state';


@Component({
  selector: 'app-landing-page',

  imports: [
    NgIcon,
    CustomButton
  ],

  providers: [
    provideIcons({
      lucideChartNoAxesCombined,
      lucideShieldCheck,
      lucideGauge,
      lucideUsers,
      lucidePackageCheck
    })
  ],

  templateUrl: './landing-page.html',

  styleUrl: './landing-page.css'
})
/*Princpal landing page */
export class LandingPage {

  /* Attributes */
  private readonly authState = inject(AuthState);

  readonly isAuthenticated = this.authState.isAuthenticated;

  readonly lucideLogInIcon = lucideLogIn;

  readonly lucideChartIcon = lucideChartNoAxesCombined;

  readonly lucidePortalIcon = lucideLayoutDashboard;


  private readonly router = inject(Router);


  readonly commitments: Commitment[] = [

    {
      title: 'Control',
      description:
        'Mantén una visión clara de los movimientos de tu inventario.',
      icon: lucideGauge
    },

    {
      title: 'Seguridad',
      description:
        'Protege y administra los roles de tus empleados.',
      icon: lucideShieldCheck
    },

    {
      title: 'Eficiencia',
      description:
        'Reduce tareas innecesarias y simplifica tus procesos.',
      icon: lucideChartNoAxesCombined
    },

    {
      title: 'Clientes',
      description:
        'Centraliza la información y gestiona transacciones de forma rapida.',
      icon: lucideUsers
    }

  ];


  scrollToSection(
    section: string
  ): void {

    document
      .getElementById(section)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

  }


  //Method to navitate to the portal
  goToPortal(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

  //Method to navitate to the Login
  login(): void {

    this.router.navigate([
      '/auth/login'
    ]);

  }

}