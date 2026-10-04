import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../../components/dashboard/topbar/topbar';
import { MobileSidebar } from '../../components/dashboard/mobile-sidebar/mobile-sidebar';
import { Sidebar } from '../../components/dashboard/sidebar/sidebar';
import { NavItem } from '../../features/users/constants/nav-item';
import { lucideFolder, lucideHistory, lucideTrash2, lucideUsers } from '@ng-icons/lucide';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, Sidebar, Topbar, MobileSidebar],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout {
  private readonly authService = inject(AuthService);
 
  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
 
  readonly navItems: NavItem[] = [
    { label: 'Mis archivos',        route: '/drive/files',    icon: lucideFolder },
    { label: 'Compartidos conmigo', route: '/drive/shared',   icon: lucideUsers },
    { label: 'Papelera',            route: '/drive/trash',    icon: lucideTrash2 },
    { label: 'Actividad',           route: '/drive/activity', icon: lucideHistory },
  ];
 
  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }
  toggleMobileSidebar(): void { this.mobileSidebarOpen.update(v => !v); }
  closeMobileSidebar(): void { this.mobileSidebarOpen.set(false); }
 
  logout(): void { this.authService.logout(); }
}
