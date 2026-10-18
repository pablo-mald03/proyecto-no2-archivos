import { Component, computed, inject, signal } from '@angular/core';
import { AuthState } from '../../../stores/auth.state';
import { DRIVE_NAV_OPTIONS, HOME_NAV_OPTIONS } from '../../drive/drive-nav/constants/drive-nav.options';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { ToastService } from '../../../core/services/toast.service';
import { DriveItem } from '../../../features/drive/drive-item.model';
import { DriveItemRow } from '../../common/drive-item-row/drive-item-row';

@Component({
  selector: 'app-drive-home',
  imports: [RouterLink, NgIcon, CustomCard, DriveItemRow],
  templateUrl: './drive-home.html',
  styleUrl: './drive-home.css',
  host: { class: 'flex flex-col h-full min-h-0 overflow-y-auto pr-2' }
})
//Principal dirve home component page
export class DriveHome {
  //Dependencies
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly firstName = computed(() => this.authState.user()?.firstName ?? '');
  readonly shortcuts = HOME_NAV_OPTIONS;

  // Mock for files
  readonly recentItems = signal<DriveItem[]>([
    { id: '2', name: 'Notas de Arquitectura.md', type: 'file', extension: 'md', sizeBytes: 15400, updatedAt: new Date(), shared: true },
    { id: '3', name: 'Credenciales_Servidor.txt', type: 'file', extension: 'txt', sizeBytes: 1024, updatedAt: new Date() },
    { id: '4', name: 'Guía de Despliegue.md', type: 'file', extension: 'md', sizeBytes: 45200, updatedAt: new Date() }
  ]);

  onOpenItem(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
    } else {
      this.toastService.success(`Abriendo previsualización de ${item.name}`, 'Vista Previa');
    }
  }

  onShare(item: DriveItem): void {
    this.toastService.success(`Enlace de '${item.name}' copiado.`, 'Compartir');
  }

  onPreview(item: DriveItem): void {
    this.onOpenItem(item);
  }

  onDownload(item: DriveItem): void {
    this.toastService.success(`Descargando ${item.name}...`, 'Descarga');
  }

  onDelete(item: DriveItem): void {
    this.recentItems.update(list => list.filter(i => i.id !== item.id));
    this.toastService.success(`Eliminado '${item.name}'`, 'Papelera');
  }
}