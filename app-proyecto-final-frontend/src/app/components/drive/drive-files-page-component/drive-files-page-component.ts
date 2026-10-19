import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { ToastService } from '../../../core/services/toast.service';
import { DriveItem } from '../../../features/drive/drive-item.model';
import { lucideChevronDown, lucidePlus, lucideSearch, lucideSlidersHorizontal } from '@ng-icons/lucide';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadFileModalComponent } from '../../files/upload-file-modal-component/upload-file-modal-component';
import { DriveActionService } from '../../../core/services/drive-action.service';
import { FolderModalComponent } from '../../directories/folder-modal-component/folder-modal-component';
import { DriveItemListComponent } from '../drive-item-list-component/drive-item-list-component';
import { DriveMoveModalComponent } from '../../directories/drive-move-modal-component/drive-move-modal-component';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { FilePreviewLayoutComponent } from '../../viewer/file-preview-layout-component/file-preview-layout-component';

@Component({
  selector: 'app-drive-files-page-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    CustomButton,
    CustomCard,
    CustomTextfield,
    CustomAlert,
    CustomInfiniteScroll,
    UploadFileModalComponent,
    FolderModalComponent,
    DriveItemListComponent,
    DriveMoveModalComponent,
    FilePreviewLayoutComponent
],
  templateUrl: './drive-files-page-component.html',
  styleUrl: './drive-files-page-component.css',
  host: { class: 'flex flex-col h-full min-h-0' }
})
//Drive files page component model
export class DriveFilesPageComponent implements OnInit {

  // Services
  readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly driveAction = inject(DriveActionService);

  // Filters State
  readonly filtersExpanded = signal(false);
  readonly searchControl = new FormControl('', { nonNullable: true });

  // Infinite Scroll & Data State
  readonly items = signal<DriveItem[]>([]);
  readonly loading = signal(false);
  readonly initialized = signal(false);
  readonly hasMore = signal(true);

  // Icons
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucidePlusIcon = lucidePlus;

  // Upload modal status
  readonly isUploadModalOpen = signal(false);

  // Folder modal state
  readonly isFolderModalOpen = signal(false);
  readonly folderModalMode = signal<'create' | 'rename'>('create');
  readonly folderInitialName = signal('');
  readonly folderItemType = signal<'folder' | 'file'>('folder');

  // Move modal state
  readonly isMoveModalOpen = signal(false);
  readonly itemToMove = signal<DriveItem | null>(null);

  // Current Directory State
  readonly currentFolderId = signal<string | null>(null);
  readonly isInsideFolder = computed(() => !!this.currentFolderId());


  readonly isPreviewOpen = signal(false);
  readonly selectedPreviewItem = signal<DriveItem | null>(null);
  readonly previewContent = signal<string>('# Contenido del Archivo\n\nEste es un texto simulado para previsualizar el archivo `.md` o `.txt` con soporte de comentarios en burbujas.');

  constructor() {
    effect(() => {
      if (this.driveAction.uploadTriggered()) {
        this.openUploadModal();
      }

      if (this.driveAction.folderModalOpen()) {
        this.folderModalMode.set(this.driveAction.folderModalMode());
        this.folderItemType.set(this.driveAction.folderItemType()); 
        this.folderInitialName.set(this.driveAction.folderInitialName());
        this.isFolderModalOpen.set(true);
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const folderId = params.get('id');
      this.currentFolderId.set(folderId);
      this.loadMockFiles(folderId);
    });
  }

  // Load mock items for current folder
  loadMockFiles(folderId: string | null): void {
    this.loading.set(true);
    this.initialized.set(false);

    setTimeout(() => {
      let mockData: DriveItem[] = [];

      if (!folderId) {
        mockData = [
          { id: '1', name: 'Documentación del Proyecto', type: 'folder', updatedAt: new Date() },
          { id: '2', name: 'Carpeta Personal', type: 'folder', updatedAt: new Date() },
          { id: '3', name: 'Credenciales_Servidor.txt', type: 'file', extension: 'txt', sizeBytes: 1024, updatedAt: new Date() },
          { id: '4', name: 'Guía de Despliegue.md', type: 'file', extension: 'md', sizeBytes: 45200, updatedAt: new Date() }
        ];
      } else if (folderId === '1') {
        mockData = [
          { id: '1-1', name: 'Notas de Arquitectura.md', type: 'file', extension: 'md', sizeBytes: 15400, updatedAt: new Date(), shared: true },
          { id: '1-2', name: 'Subcarpeta Backend', type: 'folder', updatedAt: new Date() }
        ];
      } else if (folderId === '2') {
        mockData = [
          { id: '2-1', name: 'Apuntes Personales.txt', type: 'file', extension: 'txt', sizeBytes: 512, updatedAt: new Date() }
        ];
      } else if (folderId === '1-2') {
        mockData = [
          { id: '1-2-1', name: 'Endpoints_API.md', type: 'file', extension: 'md', sizeBytes: 8900, updatedAt: new Date() }
        ];
      }

      this.items.set(mockData);
      this.loading.set(false);
      this.initialized.set(true);
      this.hasMore.set(false);
    }, 400);
  }

  readonly previewComments = signal<FileComment[]>([
    { id: 'c1', authorName: 'Carlos Pérez', createdAt: new Date(), content: 'Excelente documentación, muy clara.', isOwner: false },
    { id: 'c2', authorName: 'Tú', createdAt: new Date(), content: 'Gracias Carlos, cualquier ajuste me avisas.', isOwner: true }
  ]);

  // Upload Modal handlers
  openUploadModal(): void {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.isUploadModalOpen.set(false);
  }

  handleFileUpload(file: File): void {
    const parentId = this.currentFolderId();
    console.log(`Subiendo archivo '${file.name}' al directorio parentId:`, parentId);
    this.toastService.success(`Archivo '${file.name}' subido con éxito.`, 'Subida completada');
    this.loadMockFiles(parentId);
  }

  // Drag and Drop move handler
  handleItemDrop(event: { draggedItem: DriveItem; targetFolder: DriveItem }): void {
    const { draggedItem, targetFolder } = event;
    this.toastService.success(`Movido '${draggedItem.name}' a '${targetFolder.name}'`, 'Elemento movido');
    this.items.update(list => list.filter(i => i.id !== draggedItem.id));
  }

  // Folder Modal submit handler
  handleFolderSubmit(folderName: string): void {
    const parentId = this.currentFolderId();
    const mode = this.folderModalMode();
    const targetId = this.driveAction.folderTargetId();

    if (mode === 'create') {
      console.log(`Creando carpeta '${folderName}' con parentId:`, parentId);
      this.toastService.success(`Carpeta '${folderName}' creada con éxito.`, 'Carpeta creada');
    } else {
      console.log(`Renombrando ítem ID ${targetId} a '${folderName}'`);
      this.toastService.success(`Actualizado a '${folderName}'.`, 'Actualizado');
    }

    this.isFolderModalOpen.set(false);
    this.loadMockFiles(parentId);
  }

  // Open "Move to..." modal
  onMoveItem(item: DriveItem): void {
    this.itemToMove.set(item);
    this.isMoveModalOpen.set(true);
  }

  closeMoveModal(): void {
    this.isMoveModalOpen.set(false);
    this.itemToMove.set(null);
  }

  // Handle move modal selection confirm
  handleMoveTargetSelected(targetFolderId: string | null): void {
    const item = this.itemToMove();
    if (!item) return;

    const targetLabel = targetFolderId ? `carpeta ID: ${targetFolderId}` : 'Raíz (Mis Documentos)';
    this.toastService.success(`'${item.name}' movido a ${targetLabel}.`, 'Elemento movido');

    // TODO: Remove item locally from active list view
    this.items.update(list => list.filter(i => i.id !== item.id));
    this.closeMoveModal();
  }

  // Row Action Listeners
  onShare(item: DriveItem): void {
    this.toastService.success(`Enlace de '${item.name}' copiado al portapapeles.`, 'Compartir');
  }

  //Preview event
  onPreview(item: DriveItem): void {
    if (item.type === 'folder') return; 

    this.selectedPreviewItem.set(item);
    this.previewContent.set(`# ${item.name}\n\nContenido simulado para el archivo seleccionado con ID: ${item.id}\n\nPuedes hacer zoom, cambiar a modo edición, imprimir o dejar comentarios laterales.`);
    this.isPreviewOpen.set(true);
  }

  closePreview(): void {
    this.isPreviewOpen.set(false);
    this.selectedPreviewItem.set(null);
  }

  // Handle comment actions inside preview layout
  handleAddComment(content: string): void {
    const newComment: FileComment = {
      id: Date.now().toString(),
      authorName: 'Tú',
      createdAt: new Date(),
      content: content,
      isOwner: true
    };
    this.previewComments.update(list => [...list, newComment]);
    this.toastService.success('Comentario añadido.', 'Comentarios');
  }

  handleDeleteComment(commentId: string): void {
    this.previewComments.update(list => list.filter(c => c.id !== commentId));
    this.toastService.success('Comentario eliminado.', 'Comentarios');
  }


  //Download event
  onDownload(item: DriveItem): void {
    this.toastService.success(`Descargando ${item.name}...`, 'Descarga');
  }

  onDelete(item: DriveItem): void {
    this.items.update(list => list.filter(i => i.id !== item.id));
    this.toastService.success(`Se eliminó '${item.name}' correctamente.`, 'Eliminado');
  }

  //open event method
  onOpenItem(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
    } else {
      this.onPreview(item);
    }
  }

  onRename(item: DriveItem): void {
    this.driveAction.openRenameModal(item.id, item.name, item.type);
  }

  closeFolderModal(): void {
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
  }

  loadMore(): void {}
}