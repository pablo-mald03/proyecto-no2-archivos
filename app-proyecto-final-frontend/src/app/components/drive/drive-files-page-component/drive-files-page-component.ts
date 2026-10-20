import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { ToastService } from '../../../core/services/toast.service';
import { DriveItem, mapFileToDriveItem, mapFolderToDriveItem } from '../../../features/drive/drive-item.model';
import { lucideChevronDown, lucidePlus, lucideSearch, lucideSlidersHorizontal } from '@ng-icons/lucide';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadFileModalComponent } from '../../files/upload-file-modal-component/upload-file-modal-component';
import { DriveActionService } from '../../../core/services/drive-action.service';
import { FolderModalComponent } from '../../directories/folder-modal-component/folder-modal-component';
import { DriveItemListComponent } from '../drive-item-list-component/drive-item-list-component';
import { DriveMoveModalComponent } from '../../directories/drive-move-modal-component/drive-move-modal-component';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { FilePreviewLayoutComponent } from '../../viewer/file-preview-layout-component/file-preview-layout-component';
import { AuthState } from '../../../stores/auth.state';
import { FileService } from '../../../features/files/service/file.service';
import { FolderService } from '../../../features/folders/service/folder.service';
import { TrashService } from '../../../features/trash/service/trash.service';
import { CommentService } from '../../../features/comments/service/comment.service';

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
  private readonly folderService = inject(FolderService);
  private readonly fileService = inject(FileService);
  private readonly trashService = inject(TrashService);
  private readonly commentService = inject(CommentService);
  private readonly authState = inject(AuthState);

  // Filters State
  readonly filtersExpanded = signal(false);
  readonly searchControl = new FormControl('', { nonNullable: true });

  // Infinite Scroll & Data State
  private readonly allRawItems = signal<DriveItem[]>([]);
  readonly items = signal<DriveItem[]>([]);
  readonly loading = signal(false);
  readonly initialized = signal(false);
  readonly hasMore = signal(false);

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

  // File Preview Modal State Signals
  readonly isPreviewOpen = signal(false);
  readonly selectedPreviewItem = signal<DriveItem | null>(null);
  readonly previewContent = signal<string>('');
  readonly previewComments = signal<FileComment[]>([]);

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

    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.applyFilter(searchTerm);
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const folderId = params.get('id');
      this.currentFolderId.set(folderId);
      this.loadFolderContent(folderId);
    });
  }

  // Fetch real items for the current folder from api
  loadFolderContent(folderId: string | null): void {
    this.loading.set(true);
    this.initialized.set(false);

    const request$ = folderId
      ? this.folderService.findFolderContent(folderId)
      : this.folderService.findRootContent();

    request$.subscribe({
      next: (response) => {
        const folders: DriveItem[] = (response.folders || []).map(f => mapFolderToDriveItem(f));
        const files: DriveItem[] = (response.files || []).map(f => mapFileToDriveItem(f));
        const combined = [...folders, ...files];

        this.allRawItems.set(combined);
        this.applyFilter(this.searchControl.value);
        this.loading.set(false);
        this.initialized.set(true);
        this.hasMore.set(false);
      },
      error: (err) => {
        this.allRawItems.set([]);
        this.items.set([]);
        this.loading.set(false);
        this.initialized.set(true);
        this.hasMore.set(false);
        this.toastService.error(err.message || 'Error al cargar el contenido de la carpeta.', 'Error');
      }
    });
  }

  // Filter items in memory by search query
  private applyFilter(query: string): void {
    const raw = this.allRawItems();
    const trimmed = (query || '').trim().toLowerCase();

    if (!trimmed) {
      this.items.set(raw);
      return;
    }

    const filtered = raw.filter(item =>
      item.name.toLowerCase().includes(trimmed)
    );
    this.items.set(filtered);
  }

  // Upload Modal handlers
  openUploadModal(): void {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.isUploadModalOpen.set(false);
  }

  // Upload real file to the backend
  handleFileUpload(file: File): void {
    const parentId = this.currentFolderId();
    this.fileService.uploadFiles([file], parentId).subscribe({
      next: () => {
        this.toastService.success(`Archivo '${file.name}' subido con éxito.`, 'Subida completada');
        this.closeUploadModal();
        this.loadFolderContent(parentId);
      },
      error: (err) => {
        this.toastService.error(err.message || 'Error al subir el archivo.', 'Error');
      }
    });
  }

  // Drag and Drop move handler
  handleItemDrop(event: { draggedItem: DriveItem; targetFolder: DriveItem }): void {
    const { draggedItem, targetFolder } = event;

    if (draggedItem.type === 'folder') {
      this.folderService.moveFolder(draggedItem.id, {
        targetParentId: targetFolder.id
      }).subscribe({
        next: () => this.handleDropSuccess(draggedItem, targetFolder),
        error: (err) => this.handleMoveError(err)
      });

      return;
    }

    this.fileService.moveFile(draggedItem.id, {
      targetFolderId: targetFolder.id
    }).subscribe({
      next: () => this.handleDropSuccess(draggedItem, targetFolder),
      error: (err) => this.handleMoveError(err)
    });
  }

  // Handle a successful drag-and-drop move
  private handleDropSuccess(draggedItem: DriveItem, targetFolder: DriveItem): void {
    this.toastService.success(
      `Movido '${draggedItem.name}' a '${targetFolder.name}'`,
      'Elemento movido'
    );
    this.loadFolderContent(this.currentFolderId());
  }

  // Folder Modal submit handler (create or rename)
  handleFolderSubmit(folderName: string): void {
    const parentId = this.currentFolderId();
    const mode = this.folderModalMode();

    if (mode === 'create') {
      this.folderService.createFolder({ name: folderName, parentId }).subscribe({
        next: (created) => this.handleCreateSuccess(created.name, parentId),
        error: (err) => this.handleCreateError(err)
      });

      return;
    }

    const targetId = this.driveAction.folderTargetId();
    if (!targetId) return;

    const type = this.folderItemType();

    if (type === 'folder') {
      this.folderService.renameFolder(targetId, { name: folderName }).subscribe({
        next: () => this.handleRenameSuccess(folderName, parentId),
        error: (err) => this.handleRenameError(err)
      });

      return;
    }

    this.fileService.renameFile(targetId, { name: folderName }).subscribe({
      next: () => this.handleRenameSuccess(folderName, parentId),
      error: (err) => this.handleRenameError(err)
    });
  }

  // Handle a successful folder creation
  private handleCreateSuccess(name: string, parentId: string | null): void {
    this.toastService.success(`Carpeta '${name}' creada con éxito.`, 'Carpeta creada');
    this.isFolderModalOpen.set(false);
    this.loadFolderContent(parentId);
  }

  // Handle a folder creation error
  private handleCreateError(err: Error): void {
    this.toastService.error(err.message || 'Error al crear la carpeta.', 'Error');
  }

  // Handle a successful rename
  private handleRenameSuccess(newName: string, parentId: string | null): void {
    this.toastService.success(`Actualizado a '${newName}'.`, 'Actualizado');
    this.isFolderModalOpen.set(false);
    this.loadFolderContent(parentId);
  }

  // Handle a rename error
  private handleRenameError(err: Error): void {
    this.toastService.error(err.message || 'Error al renombrar el elemento.', 'Error');
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

    if (item.type === 'folder') {
      this.folderService.moveFolder(item.id, {
        targetParentId: targetFolderId
      }).subscribe({
        next: () => this.handleMoveTargetSuccess(item.name, targetFolderId),
        error: (err) => this.handleMoveError(err)
      });

      return;
    }

    this.fileService.moveFile(item.id, {
      targetFolderId
    }).subscribe({
      next: () => this.handleMoveTargetSuccess(item.name, targetFolderId),
      error: (err) => this.handleMoveError(err)
    });
  }

  // Handle a successful move to the selected target
  private handleMoveTargetSuccess(itemName: string, targetFolderId: string | null): void {
    const targetLabel = targetFolderId ? 'la carpeta destino' : 'Raíz (Mis Documentos)';
    this.toastService.success(`'${itemName}' movido a ${targetLabel}.`, 'Elemento movido');
    this.closeMoveModal();
    this.loadFolderContent(this.currentFolderId());
  }

  // Handle a move error
  private handleMoveError(err: Error): void {
    this.toastService.error(err.message || 'Error al mover el elemento.', 'Error');
  }

  // Row Action Listeners
  onShare(item: DriveItem): void {
    const shareUrl = `${window.location.origin}/drive/files/${item.type === 'folder' ? 'folder/' : ''}${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.toastService.success(`Enlace de '${item.name}' copiado al portapapeles.`, 'Compartir');
      }).catch(() => {
        this.toastService.info(`Enlace: ${shareUrl}`, 'Compartir');
      });
    } else {
      this.toastService.info(`Enlace: ${shareUrl}`, 'Compartir');
    }
  }

  // Preview event and fetch content + comments from real backend
  onPreview(item: DriveItem): void {
    if (item.type === 'folder') return;

    this.selectedPreviewItem.set(item);
    this.previewContent.set('Cargando contenido del archivo...');
    this.previewComments.set([]);
    this.isPreviewOpen.set(true);

    this.fileService.getFileContent(item.id).subscribe({
      next: (content) => {
        this.previewContent.set(content);
      },
      error: () => {
        this.previewContent.set('');
      }
    });

    this.reloadPreviewComments(item.id);
  }

  closePreview(): void {
    this.isPreviewOpen.set(false);
    this.selectedPreviewItem.set(null);
  }

  // Handle comment actions inside preview layout
  handleAddComment(content: string): void {
    const item = this.selectedPreviewItem();
    if (!item) return;

    this.commentService.createComment(item.id, { content }).subscribe({
      next: () => {
        this.toastService.success('Comentario añadido.', 'Comentarios');
        this.reloadPreviewComments(item.id);
      },
      error: (err) => {
        this.toastService.error(err.message || 'Error al añadir el comentario.', 'Error');
      }
    });
  }

  handleDeleteComment(commentId: string): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.previewComments.update(list => list.filter(c => c.id !== commentId));
        this.toastService.success('Comentario eliminado.', 'Comentarios');
      },
      error: (err) => {
        this.toastService.error(err.message || 'Error al eliminar el comentario.', 'Error');
      }
    });
  }

  private reloadPreviewComments(fileId: string): void {
    this.commentService.getCommentsByFile(fileId).subscribe({
      next: (comments) => {
        const currentUserId = this.authState.user()?.id;
        const mappedComments: FileComment[] = comments.map(c => ({
          id: c.id,
          authorName: c.authorUsername || c.authorEmail || 'Usuario',
          createdAt: new Date(c.createdAt),
          content: c.content,
          isOwner: currentUserId ? c.authorId === currentUserId : false
        }));
        this.previewComments.set(mappedComments);
      },
      error: () => {
        this.previewComments.set([]);
      }
    });
  }

  // Download real file from backend
  onDownload(item: DriveItem): void {
    if (item.type === 'folder') return;

    this.fileService.downloadFile(item.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.toastService.success(`Descargando ${item.name}...`, 'Descarga');
      },
      error: (err) => {
        this.toastService.error(err.message || 'Error al descargar el archivo.', 'Error');
      }
    });
  }

  // Delete item sending it to trash
  onDelete(item: DriveItem): void {
    const type = item.type === 'folder' ? 'folders' : 'files';
    this.trashService.moveToTrash(type, item.id).subscribe({
      next: () => {
        this.toastService.success(`Se envió '${item.name}' a la papelera.`, 'Papelera');
        this.loadFolderContent(this.currentFolderId());
      },
      error: (err) => {
        this.toastService.error(err.message || 'Error al mover a la papelera.', 'Error');
      }
    });
  }

  // Open item event method
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

  loadMore(): void { }
}