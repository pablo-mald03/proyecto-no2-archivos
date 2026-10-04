import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from "../../components/dashboard/sidebar/sidebar";
import { Topbar } from "../../components/dashboard/topbar/topbar";
import { MobileSidebar } from '../../components/dashboard/mobile-sidebar/mobile-sidebar';
import { AuthService } from '../../features/auth/services/auth.service';
import { ErrorResponse } from '../../features/errors/models/error-response.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    Sidebar,
    Topbar,
    MobileSidebar
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
/* Dashboard layout module */
export class DashboardLayout {


  //Dependency inversion
  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  private readonly toastService = inject(ToastService);


  //Sidebar signals
  sidebarCollapsed = signal(false);

  mobileSidebarOpen = signal(false);


  /*toggle sidebar for desktop */
  toggleSidebar(): void {

    this.sidebarCollapsed.update(
      collapsed => !collapsed
    );

  }


  /*Toggle mobile sidebar */
  toggleMobileSidebar(): void {

    this.mobileSidebarOpen.update(
      open => !open
    );

  }


  //Close mobile sidebar method
  closeMobileSidebar(): void {

    this.mobileSidebarOpen.set(false);

  }

  /* Logout action */
  logout(): void {

    this.authService.logout()
      .subscribe({
        next: () => {
          this.toastService.success('Se ha cerrado sesion correctamente','Sesión cerrada');
          this.router.navigate([
            '/'
          ]);

        },
        error: (error: ErrorResponse) => {

          this.toastService.error(
            error.message || 'Ha ocurido un error',
            'Error al cerrar sesion'
          );

        }
      });

  }

}
