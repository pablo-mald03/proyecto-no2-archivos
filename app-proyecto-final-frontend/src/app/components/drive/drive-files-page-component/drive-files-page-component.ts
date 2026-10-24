import { Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { ToastService } from '../../../core/services/toast.service';
import { DriveItem, mapFileToDriveItem, mapFolderToDriveItem } from '../../../features/drive/drive-item.model';
import { lucideChevronDown, lucideFolderPlus, lucidePlus, lucideRotateCcw, lucideSearch, lucideSlidersHorizontal } from '@ng-icons/lucide';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadFileModalComponent } from '../../files/upload-file-modal-component/upload-file-modal-component';
import { DriveActionService } from '../../../core/services/drive-action.service';
import { FolderModalComponent } from '../../directories/folder-modal-component/folder-modal-component';
import { DriveItemListComponent } from '../drive-item-list-component/drive-item-list-component';
import { DriveMoveModalComponent } from '../../directories/drive-move-modal-component/drive-move-modal-component';
import { FileService } from '../../../features/files/service/file.service';
import { FolderService } from '../../../features/folders/service/folder.service';
import { TrashService } from '../../../features/trash/service/trash.service';
import { EmptyStateComponent } from '../../common/empty-state-component/empty-state-component';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { FileUploadQueueService } from '../../../features/files/service/file-upload-queue.service';
import { ShareModalComponent } from '../../sharing/share-modal-component/share-modal-component';
import { ListFolderContentQueryParams } from '../../../features/folders/models/request/list-folder-content-query.model';
import { debounceTime, merge } from 'rxjs';
import { PermissionFlags } from '../../../features/shares/models/permissions-flags.model';
import { PermissionRole } from '../../../features/shares/constants/share.constants';
import { resolveFlags } from '../../../core/utils/file-permissions.util';
import { StorageState } from '../../../stores/storage.state';

@Component({
  selector: 'app-drive-files-page-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    CustomButton,
    CustomCard,
    CustomTextfield,
    CustomDropdown,
    CustomInfiniteScroll,
    UploadFileModalComponent,
    FolderModalComponent,
    DriveItemListComponent,
    DriveMoveModalComponent,
    EmptyStateComponent,
    ShareModalComponent
  ],
  templateUrl: './drive-files-page-component.html',
  styleUrl: './drive-files-page-component.css',
  host: { class: 'block h-full min-h-0' }
})
// Principal drive files page component with server-side pagination, filters, and infinite scroll
export class DriveFilesPageComponent implements OnInit {

  // Services
  readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly driveAction = inject(DriveActionService);
  private readonly folderService = inject(FolderService);
  private readonly fileService = inject(FileService);
  private readonly trashService = inject(TrashService);
  private readonly uploadQueueService = inject(FileUploadQueueService);
  private readonly storage = inject(StorageState);

  // Pagination & Loading State
  readonly pageSize = 15;
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly hasMore = computed(() => this.currentPage() + 1 < this.totalPages());

  readonly items = signal<DriveItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly loadingMore = signal<boolean>(false);
  readonly initialized = signal<boolean>(false);

  // Current Directory State
  readonly currentFolderId = signal<string | null>(null);
  readonly currentFolderName = signal<string>('Contenido');
  readonly isInsideFolder = computed(() => !!this.currentFolderId());

  readonly currentRole = signal<PermissionRole>('OWNER');
  readonly folderFlags = computed(() => resolveFlags(this.currentRole()));

  // Filters State
  readonly filtersExpanded = signal(false);
  readonly searchControl = new FormControl<string | null>('');
  readonly typeControl = new FormControl<'ALL' | 'FOLDERS_ONLY' | 'FILES_ONLY'>('ALL', { nonNullable: true });
  readonly extensionControl = new FormControl<'txt' | 'md' | null>(null);
  readonly sortByControl = new FormControl<'name' | 'createdAt' | 'updatedAt' | 'sizeBytes'>('name', { nonNullable: true });
  readonly directionControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });

  // Filter Options
  readonly typeOptions = [
    { value: 'ALL', label: 'Todos' },
    { value: 'FOLDERS_ONLY', label: 'Solo carpetas' },
    { value: 'FILES_ONLY', label: 'Solo archivos' }
  ];

  readonly extensionOptions = [
    { value: 'txt', label: 'Texto (.txt)' },
    { value: 'md', label: 'Markdown (.md)' }
  ];

  readonly sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'updatedAt', label: 'Fecha de modificación' },
    { value: 'sizeBytes', label: 'Tamaño' }
  ];

  readonly directionOptions = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
  ];

  // Active filters helper
  readonly hasActiveFilters = computed(() => {
    const hasSearch = !!this.searchControl.value?.trim();
    const hasType = this.typeControl.value !== 'ALL';
    const hasExt = !!this.extensionControl.value;
    const hasSort = this.sortByControl.value !== 'name';
    const hasDir = this.directionControl.value !== 'desc';
    return hasSearch || hasType || hasExt || hasSort || hasDir;
  });

  // Empty state status
  readonly emptyStateType = computed(() => {
    if (!this.initialized() || (this.loading() && this.items().length === 0)) {
      return 'loading';
    }
    if (this.items().length === 0 && this.hasActiveFilters()) {
      return 'search-empty';
    }
    if (this.items().length === 0) {
      return 'folder-empty';
    }
    return 'has-content';
  });

  // Icons
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucidePlusIcon = lucidePlus;
  readonly lucideFolderPlusIcon = lucideFolderPlus;
  readonly lucideRotateCcwIcon = lucideRotateCcw;

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

  // Share modal state
  readonly isShareModalOpen = signal(false);
  readonly itemToShare = signal<DriveItem | null>(null);

  constructor() {
    effect(() => {
      if (this.driveAction.uploadTriggered()) {
        untracked(() => this.openUploadModal());
      }

      if (this.driveAction.folderModalOpen()) {
        const allowed = untracked(() => this.ensure('canEdit', 'crear o renombrar'));
        if (!allowed) {
          this.driveAction.closeFolderModal();
          return;
        }

        this.folderModalMode.set(this.driveAction.folderModalMode());
        this.folderItemType.set(this.driveAction.folderItemType());
        this.folderInitialName.set(this.driveAction.folderInitialName());
        this.isFolderModalOpen.set(true);
      }
    });

    // Reactive filter triggers
    merge(
      this.searchControl.valueChanges.pipe(debounceTime(300)),
      this.typeControl.valueChanges,
      this.extensionControl.valueChanges,
      this.sortByControl.valueChanges,
      this.directionControl.valueChanges
    ).subscribe(() => {
      this.fetchContent({ reset: true });
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const folderId = params.get('id');
      this.currentFolderId.set(folderId);
      this.fetchContent({ reset: true });
    });

    this.uploadQueueService.fileUploaded$.subscribe(uploaded => {
      if (uploaded.folderId === this.currentFolderId()) {
        this.fetchContent({ reset: true });
      }
    });
  }

  private ensure(flag: keyof PermissionFlags, action: string): boolean {
    if (this.folderFlags()[flag]) return true;
    this.toastService.warning(`No tienes permiso para ${action} en esta carpeta.`, 'Permiso denegado');
    return false;
  }

  // Fetch folder or root content using server-side pagination and filters
  private fetchContent({ reset = false }: { reset?: boolean } = {}): void {
    const folderId = this.currentFolderId();
    const targetPage = reset ? 0 : this.currentPage() + 1;

    if (reset) {
      this.loading.set(true);
      this.initialized.set(false);
    } else {
      this.loadingMore.set(true);
    }

    const queryParams: ListFolderContentQueryParams = {
      page: targetPage,
      size: this.pageSize,
      sortBy: this.sortByControl.value,
      direction: this.directionControl.value,
      search: this.searchControl.value?.trim() || undefined,
      type: this.typeControl.value,
      extension: this.extensionControl.value || undefined
    };

    this.folderService.getFolderContent(folderId, queryParams).subscribe({
      next: (response) => {
        if (response.currentFolder) {
          this.currentFolderName.set(response.currentFolder.name);
          this.currentRole.set(response.currentFolder.permissions?.role ?? 'VIEWER');
        } else {
          this.currentFolderName.set('Mis Documentos');
          this.currentRole.set('OWNER');
        }

        const newFolders = (response.folders?.content || []).map(f => mapFolderToDriveItem(f));
        const newFiles = (response.files?.content || []).map(f => mapFileToDriveItem(f));
        const combined = [...newFolders, ...newFiles];

        const totalFoldersPages = response.folders?.totalPages || 0;
        const totalFilesPages = response.files?.totalPages || 0;
        const maxPages = Math.max(totalFoldersPages, totalFilesPages);

        const totalFoldersElements = response.folders?.totalElements || 0;
        const totalFilesElements = response.files?.totalElements || 0;
        const totalElements = totalFoldersElements + totalFilesElements;

        this.totalPages.set(maxPages);
        this.totalElements.set(totalElements);
        this.currentPage.set(targetPage);

        if (reset) {
          this.items.set(combined);
          this.loading.set(false);
          this.initialized.set(true);
        } else {
          this.items.update(prev => [...prev, ...combined]);
          this.loadingMore.set(false);
        }
      },
      error: (err: ErrorResponse) => {
        if (reset) {
          this.items.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
          this.loading.set(false);
          this.initialized.set(true);
        } else {
          this.loadingMore.set(false);
        }
        this.toastService.error(err.message || 'Error al cargar los documentos.', 'Error');
      }
    });
  }

  // Load next page on scroll bottom reached
  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) {
      return;
    }
    this.fetchContent({ reset: false });
  }

  // Reset filters
  resetFilters(): void {
    this.searchControl.setValue('');
    this.typeControl.setValue('ALL');
    this.extensionControl.setValue(null);
    this.sortByControl.setValue('name');
    this.directionControl.setValue('desc');
  }

  // Folder modal handlers
  openCreateFolderModal(): void {
    if (!this.ensure('canEdit', 'crear carpetas')) return; 
    this.folderModalMode.set('create');
    this.folderItemType.set('folder');
    this.folderInitialName.set('');
    this.isFolderModalOpen.set(true);
  }

  // Upload Modal handlers
  openUploadModal(): void {
    if (!this.ensure('canEdit', 'subir archivos')) return; 
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.isUploadModalOpen.set(false);
  }

  // Enqueue files for sequential background upload
  handleFilesUpload(files: File[]): void {
    const parentId = this.currentFolderId();
    this.uploadQueueService.enqueueFiles(files, parentId);
    this.closeUploadModal();
  }

  // Drag and Drop move handler
  handleItemDrop(event: { draggedItem: DriveItem; targetFolder: DriveItem }): void {
    if (!this.ensure('canEdit', 'mover elementos')) return; 
    const { draggedItem, targetFolder } = event;

    if (draggedItem.type === 'folder') {
      this.folderService.moveFolder(draggedItem.id, {
        targetParentId: targetFolder.id
      }).subscribe({
        next: () => this.handleDropSuccess(draggedItem, targetFolder),
        error: (err: ErrorResponse) => this.handleMoveError(err)
      });

      return;
    }

    this.fileService.moveFile(draggedItem.id, {
      targetFolderId: targetFolder.id
    }).subscribe({
      next: () => this.handleDropSuccess(draggedItem, targetFolder),
      error: (err: ErrorResponse) => this.handleMoveError(err)
    });
  }

  // Handle a successful drag-and-drop move
  private handleDropSuccess(draggedItem: DriveItem, targetFolder: DriveItem): void {
    this.toastService.success(
      `Movido '${draggedItem.name}' a '${targetFolder.name}'`,
      'Elemento movido'
    );
    this.fetchContent({ reset: true });
  }

  // Folder Modal submit handler (create or rename)
  handleFolderSubmit(folderName: string): void {
    const parentId = this.currentFolderId();
    const mode = this.folderModalMode();

    if (mode === 'create') {
      this.folderService.createFolder({ name: folderName, parentId }).subscribe({
        next: (created) => this.handleCreateSuccess(created.name),
        error: (err: ErrorResponse) => this.handleCreateError(err)
      });

      return;
    }

    const targetId = this.driveAction.folderTargetId();
    if (!targetId) return;

    const type = this.folderItemType();

    if (type === 'folder') {
      this.folderService.renameFolder(targetId, { name: folderName }).subscribe({
        next: () => this.handleRenameSuccess(folderName),
        error: (err: ErrorResponse) => this.handleRenameError(err)
      });

      return;
    }

    this.fileService.renameFile(targetId, { name: folderName }).subscribe({
      next: () => this.handleRenameSuccess(folderName),
      error: (err: ErrorResponse) => this.handleRenameError(err)
    });
  }

  // Handle a successful folder creation
  private handleCreateSuccess(name: string): void {
    this.toastService.success(`Carpeta '${name}' creada con éxito.`, 'Carpeta creada');
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
    this.fetchContent({ reset: true });
  }

  // Handle a folder creation error
  private handleCreateError(err: ErrorResponse): void {
    this.toastService.error(err.message || 'Error al crear la carpeta.', 'Error');
  }

  // Handle a successful rename
  private handleRenameSuccess(newName: string): void {
    this.toastService.success(`Actualizado a '${newName}'.`, 'Actualizado');
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
    this.fetchContent({ reset: true });
  }

  // Handle a rename error
  private handleRenameError(err: ErrorResponse): void {
    this.toastService.error(err.message || 'Error al renombrar el elemento.', 'Error');
  }

  // Open "Move to..." modal
  onMoveItem(item: DriveItem): void {
    if (!this.ensure('canEdit', 'mover elementos')) return; 
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
        error: (err: ErrorResponse) => this.handleMoveError(err)
      });

      return;
    }

    this.fileService.moveFile(item.id, {
      targetFolderId
    }).subscribe({
      next: () => this.handleMoveTargetSuccess(item.name, targetFolderId),
      error: (err: ErrorResponse) => this.handleMoveError(err)
    });
  }

  // Handle a successful move to the selected target
  private handleMoveTargetSuccess(itemName: string, targetFolderId: string | null): void {
    const targetLabel = targetFolderId ? 'la carpeta destino' : 'Raíz (Mis Documentos)';
    this.toastService.success(`'${itemName}' movido a ${targetLabel}.`, 'Elemento movido');
    this.closeMoveModal();
    this.fetchContent({ reset: true });
  }

  // Handle a move error
  private handleMoveError(err: ErrorResponse): void {
    this.toastService.error(err.message || 'Error al mover el elemento.', 'Error');
  }

  // Row Action Listeners
  onShare(item: DriveItem): void {
    if (!this.ensure('canShare', 'compartir')) return; 
    this.itemToShare.set(item);
    this.isShareModalOpen.set(true);
  }

  closeShareModal(): void {
    this.isShareModalOpen.set(false);
    this.itemToShare.set(null);
  }

  // Navigate directly to routed preview
  onPreview(item: DriveItem): void {
    if (item.type === 'folder') return;
    this.router.navigate(['/drive/files/preview', item.id]);
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
      error: (err: ErrorResponse) => {
        this.toastService.error(err.message || 'Error al descargar el archivo.', 'Error');
      }
    });
  }

  // Delete item sending it to trash
  onDelete(item: DriveItem): void {
    if (!this.ensure('canDelete', 'eliminar')) return; 
    const type = item.type === 'folder' ? 'folders' : 'files';
    this.trashService.moveToTrash(type, item.id).subscribe({
      next: () => {
        this.toastService.success(`Se envió '${item.name}' a la papelera.`, 'Papelera');
        this.storage.refresh(); 
        this.fetchContent({ reset: true });
      },
      error: (err: ErrorResponse) => {
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
    if (!this.ensure('canEdit', 'renombrar')) return; 
    this.driveAction.openRenameModal(item.id, item.name, item.type);
  }

  closeFolderModal(): void {
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
  }
}