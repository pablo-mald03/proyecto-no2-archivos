import { Component, inject, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChartNoAxesCombined,
  lucideLogIn,
  lucideLayoutDashboard,
  lucideFolderTree,
  lucideFileText,
  lucideSearch,
  lucideShare2,
  lucideTrash2,
  lucideHistory,
  lucideFolder
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
      lucideFolderTree,
      lucideFileText,
      lucideSearch,
      lucideShare2,
      lucideTrash2,
      lucideHistory
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

  readonly lucideSearchIcon = lucideSearch;

  readonly lucideFolderIcon = lucideFolder;

  readonly lucideFileTextIcon = lucideFileText;

  readonly lucideHistoryIcon = lucideHistory;
  readonly lucidePortalIcon = lucideLayoutDashboard;
  readonly lucideLogInIcon = lucideLogIn;


  private readonly router = inject(Router);


  readonly commitments: Commitment[] = [
    { title: 'Carpetas y subcarpetas', description: 'Organiza tus documentos por niveles y reorganízalos cuando quieras, sin romper la estructura.', icon: lucideFolderTree },
    { title: 'Archivos .txt y .md', description: 'Carga, descarga, renombra y mueve tus archivos. El contenido se recupera tal como lo guardaste.', icon: lucideFileText },
    { title: 'Búsqueda y filtros', description: 'Encuentra un archivo por nombre, tipo o fecha sin abrir carpeta por carpeta.', icon: lucideSearch },
    { title: 'Compartir con permisos', description: 'Da acceso de lectura, comentario o edición a otros usuarios y retíralo cuando ya no haga falta.', icon: lucideShare2 },
    { title: 'Papelera', description: 'Lo que eliminas no se pierde de inmediato: puedes restaurarlo o borrarlo definitivamente.', icon: lucideTrash2 },
    { title: 'Historial y reportes', description: 'Consulta quién hizo qué y cuándo, y revisa reportes de uso, compartición y actividad.', icon: lucideHistory },
  ];


  //Principal scroll section method
  scrollToSection(section: string): void {

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