import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { Topbar } from '../../components/dashboard/topbar/topbar';
import { DriveSidebar } from '../../components/drive/drive-sidebar/drive-sidebar';
import { DriveMobileSidebar } from '../../components/drive/drive-mobile-sidebar/drive-mobile-sidebar';
import { ToastService } from '../../core/services/toast.service';
import { ErrorResponse } from '../../features/errors/models/error-response.model';
import { DriveActionService } from '../../core/services/drive-action.service';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, Topbar, DriveSidebar, DriveMobileSidebar],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
//Principal layout for the user service
export class UserLayout {
  //Dependencies
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly driveAction = inject(DriveActionService);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(open => !open);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  async uploadFile(): Promise<void> {
    if (!this.router.url.startsWith('/drive/files')) {
      await this.router.navigate(['/drive/files']);
    }
    this.driveAction.triggerUpload();
  }

  createFolder(): void {
    if (!this.router.url.startsWith('/drive/files')) {
      this.router.navigate(['/drive/files']).then(() => {
        this.driveAction.openCreateFolderModal();
      });
    } else {
      this.driveAction.openCreateFolderModal();
    }
  }

  //Logout method
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.success('Se ha cerrado sesion correctamente', 'Sesión cerrada');
        this.router.navigate(['/']);
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(error.message || 'Ha ocurido un error', 'Error al cerrar sesion');
      },
    });
  }
}