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
import { DriveItemListComponent } from '../../drive/drive-item-list-component/drive-item-list-component';
import { DriveMoveModalComponent } from '../../directories/drive-move-modal-component/drive-move-modal-component';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { FilePreviewLayoutComponent } from '../../viewer/file-preview-layout-component/file-preview-layout-component';

@Component({
  selector: 'app-drive-home',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    CustomCard,
    FolderModalComponent,
    DriveItemListComponent,
    DriveMoveModalComponent,
    FilePreviewLayoutComponent
],
  templateUrl: './drive-home.html',
  styleUrl: './drive-home.css',
  host: { class: 'flex flex-col h-full min-h-0 overflow-y-auto pr-2' }
})
//Principal dirve home cocomponent view
export class DriveHome {
  // Dependencies
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  readonly driveAction = inject(DriveActionService);

  readonly firstName = computed(() => this.authState.user()?.firstName ?? '');
  readonly shortcuts = HOME_NAV_OPTIONS;

  // Folder modal state signals
  readonly isFolderModalOpen = signal(false);
  readonly folderModalMode = signal<'create' | 'rename'>('create');
  readonly folderItemType = signal<'folder' | 'file'>('folder');
  readonly folderInitialName = signal('');

  // Move modal state signals
  readonly isMoveModalOpen = signal(false);
  readonly itemToMove = signal<DriveItem | null>(null);

  // File Preview Modal State Signals
  readonly isPreviewOpen = signal<boolean>(false);
  readonly activePreviewItem = signal<DriveItem | null>(null);

  // Mock content and comments database per file ID
  readonly fileContentsMock = signal<Record<string, string>>({
    '2': '# Notas de Arquitectura.md\n\nComponentes standalone en Angular 18+\nUso de Signals y efectos reactivos.\nTailwind CSS con tipografía optimizada.\n\n----\n\nTodo funcionando correctamente.',
    '3': 'DB_HOST=localhost\nDB_USER=admin\nDB_PASS=secret_secure_key_123\n\n# Nota: No compartir estas credenciales.',
    '4': '# Guía de Despliegue.md\n\nContenido simulado para el archivo seleccionado con ID: 4\n\nPuedes hacer zoom, cambiar a modo edición o dejar comentarios laterales.\n\n----\n\n¡Listo para producción!'
  });

  readonly fileCommentsMock = signal<Record<string, FileComment[]>>({
    '2': [
      { id: 'c1', authorName: 'Carlos Pérez', content: 'Excelente documentación técnica.', createdAt: new Date() }
    ],
    '3': [],
    '4': [
      { id: 'c2', authorName: 'Ana Gómez', content: 'Revisar la sección de variables de entorno.', createdAt: new Date() }
    ]
  });

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

  // Recent items mock signal
  readonly recentItems = signal<DriveItem[]>([
    { id: '2', name: 'Notas de Arquitectura.md', type: 'file', extension: 'md', sizeBytes: 15400, updatedAt: new Date(), shared: true },
    { id: '3', name: 'Credenciales_Servidor.txt', type: 'file', extension: 'txt', sizeBytes: 1024, updatedAt: new Date() },
    { id: '4', name: 'Guía de Despliegue.md', type: 'file', extension: 'md', sizeBytes: 45200, updatedAt: new Date() }
  ]);

  // Computed helper to get current file content
  readonly currentFileContent = computed(() => {
    const item = this.activePreviewItem();
    if (!item) return '';
    return this.fileContentsMock()[item.id] || 'Contenido vacío simulado.';
  });

  // Computed helper to get current file comments
  readonly currentFileComments = computed(() => {
    const item = this.activePreviewItem();
    if (!item) return [];
    return this.fileCommentsMock()[item.id] || [];
  });

  // Actions
  onOpenItem(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
    } else {
      this.onPreview(item);
    }
  }

  onShare(item: DriveItem): void {
    this.toastService.success(`Enlace de '${item.name}' copiado.`, 'Compartir');
  }

  // Method to show the file preview layout instead of just a toast
  onPreview(item: DriveItem): void {
    if (item.type === 'folder') {
      this.onOpenItem(item);
      return;
    }
    this.activePreviewItem.set(item);
    this.isPreviewOpen.set(true);
  }

  // Method to handle content saved from preview layout
  handleContentSaved(newContent: string): void {
    const item = this.activePreviewItem();
    if (!item) return;

    this.fileContentsMock.update(map => ({
      ...map,
      [item.id]: newContent
    }));
    this.toastService.success(`Archivo '${item.name}' guardado con éxito.`, 'Guardado');
  }

  // Comment handlers
  handleAddComment(content: string): void {
    const item = this.activePreviewItem();
    if (!item) return;

    const newComment: FileComment = {
      id: Date.now().toString(),
      authorName: this.firstName() || 'Usuario Actual',
      content,
      createdAt: new Date()
    };

    this.fileCommentsMock.update(map => ({
      ...map,
      [item.id]: [...(map[item.id] || []), newComment]
    }));
    this.toastService.success('Comentario añadido.', 'Comentarios');
  }

  handleDeleteComment(commentId: string): void {
    const item = this.activePreviewItem();
    if (!item) return;

    this.fileCommentsMock.update(map => ({
      ...map,
      [item.id]: (map[item.id] || []).filter(c => c.id !== commentId)
    }));
    this.toastService.success('Comentario eliminado.', 'Comentarios');
  }

  // Method to download the file
  onDownload(item: DriveItem): void {
    const content = this.fileContentsMock()[item.id] || 'Contenido simulado';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.toastService.success(`Descargando ${item.name}...`, 'Descarga');
  }

  // Method to delete the file
  onDelete(item: DriveItem): void {
    this.recentItems.update(list => list.filter(i => i.id !== item.id));
    this.toastService.success(`Eliminado '${item.name}'`, 'Papelera');
  }

  // Method to rename from home
  onRename(item: DriveItem): void {
    this.driveAction.openRenameModal(item.id, item.name, item.type);
  }

  //Method to move the item
  onMoveItem(item: DriveItem): void {
    this.itemToMove.set(item);
    this.isMoveModalOpen.set(true);
  }

  //Method to close the modal
  closeMoveModal(): void {
    this.isMoveModalOpen.set(false);
    this.itemToMove.set(null);
  }

  //Method to handle the move target
  handleMoveTargetSelected(targetFolderId: string | null): void {
    const item = this.itemToMove();
    if (!item) return;

    const targetLabel = targetFolderId ? `carpeta ID: ${targetFolderId}` : 'Mis Documentos';
    this.toastService.success(`'${item.name}' movido a ${targetLabel}.`, 'Elemento movido');

    this.recentItems.update(list => list.filter(i => i.id !== item.id));
    this.closeMoveModal();
  }

  //Method to handle the drop item
  handleItemDrop(event: { draggedItem: DriveItem; targetFolder: DriveItem }): void {
    const { draggedItem, targetFolder } = event;
    this.toastService.success(`Movido '${draggedItem.name}' a '${targetFolder.name}'`, 'Elemento movido');
    this.recentItems.update(list => list.filter(i => i.id !== draggedItem.id));
  }

  //Method to handle the folder submit
  handleFolderSubmit(newName: string): void {
    const targetId = this.driveAction.folderTargetId();
    this.recentItems.update(list =>
      list.map(i => i.id === targetId ? { ...i, name: newName, updatedAt: new Date() } : i)
    );
    this.toastService.success(`Actualizado a '${newName}' con éxito.`, 'Actualizado');
    this.isFolderModalOpen.set(false);
  }

  // Close folder modal
  closeFolderModal(): void {
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
  }
}