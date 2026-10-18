import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthState } from '../../../stores/auth.state';
import { DRIVE_NAV_OPTIONS, HOME_NAV_OPTIONS } from '../../drive/drive-nav/constants/drive-nav.options';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { ToastService } from '../../../core/services/toast.service';
import { DriveItem } from '../../../features/drive/drive-item.model';
import { DriveItemRow } from '../../common/drive-item-row/drive-item-row';
import { DriveActionService } from '../../../core/services/drive-action.service';
import { FolderModalComponent } from '../../directories/folder-modal-component/folder-modal-component';

@Component({
  selector: 'app-drive-home',
  standalone: true,
  imports: [
    RouterLink, 
    NgIcon, 
    CustomCard, 
    DriveItemRow, 
    FolderModalComponent
  ],
  templateUrl: './drive-home.html',
  styleUrl: './drive-home.css',
  host: { class: 'flex flex-col h-full min-h-0 overflow-y-auto pr-2' }
})
export class DriveHome {
  // Dependencies
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  readonly driveAction = inject(DriveActionService); 

  readonly firstName = computed(() => this.authState.user()?.firstName ?? '');
  readonly shortcuts = HOME_NAV_OPTIONS;

  // Signals para Modal
  readonly isFolderModalOpen = signal(false);
  readonly folderModalMode = signal<'create' | 'rename'>('create');
  readonly folderItemType = signal<'folder' | 'file'>('folder');
  readonly folderInitialName = signal('');

  constructor() {
    effect(() => {
      if (this.driveAction.folderModalOpen()) {
        this.folderModalMode.set(this.driveAction.folderModalMode());
        this.folderItemType.set(this.driveAction.folderItemType());
        this.folderInitialName.set(this.driveAction.folderInitialName());
        this.isFolderModalOpen.set(true);
      }
    });
  }

  // Mock de elementos recientes
  readonly recentItems = signal<DriveItem[]>([
    { id: '2', name: 'Notas de Arquitectura.md', type: 'file', extension: 'md', sizeBytes: 15400, updatedAt: new Date(), shared: true },
    { id: '3', name: 'Credenciales_Servidor.txt', type: 'file', extension: 'txt', sizeBytes: 1024, updatedAt: new Date() },
    { id: '4', name: 'Guía de Despliegue.md', type: 'file', extension: 'md', sizeBytes: 45200, updatedAt: new Date() }
  ]);

  //Open item signal
  onOpenItem(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
    } else {
      this.toastService.success(`Abriendo previsualización de ${item.name}`, 'Vista Previa');
    }
  }

  //Method to share the item
  onShare(item: DriveItem): void {
    this.toastService.success(`Enlace de '${item.name}' copiado.`, 'Compartir');
  }

  //Method to show the file preview
  onPreview(item: DriveItem): void {
    this.onOpenItem(item);
  }

  //Method to download the file
  onDownload(item: DriveItem): void {
    this.toastService.success(`Descargando ${item.name}...`, 'Descarga');
  }

  //Method to dele the file
  onDelete(item: DriveItem): void {
    this.recentItems.update(list => list.filter(i => i.id !== item.id));
    this.toastService.success(`Eliminado '${item.name}'`, 'Papelera');
  }

  // Method to rename from home
  onRename(item: DriveItem): void {
    this.driveAction.openRenameModal(item.id, item.name, item.type);
  }

  //Hablde the submin
  handleFolderSubmit(newName: string): void {
    const targetId = this.driveAction.folderTargetId();

    this.recentItems.update(list => 
      list.map(i => i.id === targetId ? { ...i, name: newName, updatedAt: new Date() } : i)
    );

    this.toastService.success(`Actualizado a '${newName}' con éxito.`, 'Actualizado');
    this.isFolderModalOpen.set(false);
  }

  //Close folder modal
  closeFolderModal(): void {
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
  }
}