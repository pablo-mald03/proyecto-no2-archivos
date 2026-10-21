import { Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { AuthState } from '../../../stores/auth.state';
import { HOME_NAV_OPTIONS } from '../../drive/drive-nav/constants/drive-nav.options';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { ToastService } from '../../../core/services/toast.service';
import { DriveItem, mapFileToDriveItem, mapFolderToDriveItem } from '../../../features/drive/drive-item.model';
import { DriveActionService } from '../../../core/services/drive-action.service';
import { FolderModalComponent } from '../../directories/folder-modal-component/folder-modal-component';
import { DriveItemListComponent } from '../../drive/drive-item-list-component/drive-item-list-component';
import { DriveMoveModalComponent } from '../../directories/drive-move-modal-component/drive-move-modal-component';
import { FileService } from '../../../features/files/service/file.service';
import { FolderService } from '../../../features/folders/service/folder.service';
import { TrashService } from '../../../features/trash/service/trash.service';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { EmptyStateComponent } from '../../common/empty-state-component/empty-state-component';
import { lucideChevronDown, lucideHistory, lucideRotateCcw, lucideSearch, lucideSlidersHorizontal } from '@ng-icons/lucide';
import { ShareModalComponent } from '../../sharing/share-modal-component/share-modal-component';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomButton } from '../../common/custom-button/custom-button';
import { FormControl } from '@angular/forms';
import { DEFAULT_DIRECTION, DEFAULT_SORT, PAGE_SIZE } from './constants/home.constant';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { RecentFilesParams, RecentSortBy, SortDirection } from '../../../features/files/models/request/recent-files-params.model';
import { debounceTime, map, merge } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CustomDatepicker } from '../../common/custom-datepicker/custom-datepicker';

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
    EmptyStateComponent,
    ShareModalComponent,
    CustomDropdown,
    CustomTextfield,
    CustomButton,
    CustomInfiniteScroll,
    CustomDatepicker
],
  templateUrl: './drive-home.html',
  styleUrl: './drive-home.css',
  host: { class: 'flex flex-col h-full min-h-0 overflow-y-auto pr-2' }
})
//Principal drive home component view
export class DriveHome implements OnInit {
  // Dependencies
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  readonly driveAction = inject(DriveActionService);
  private readonly folderService = inject(FolderService);
  private readonly fileService = inject(FileService);
  private readonly trashService = inject(TrashService);
 
  readonly firstName = computed(() => this.authState.user()?.firstName ?? '');
  readonly shortcuts = HOME_NAV_OPTIONS;
 
  // Icons
  readonly lucideHistoryIcon = lucideHistory;
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
 
  // Folder modal state signals
  readonly isFolderModalOpen = signal(false);
  readonly folderModalMode = signal<'create' | 'rename'>('create');
  readonly folderItemType = signal<'folder' | 'file'>('folder');
  readonly folderInitialName = signal('');
 
  // Move modal state signals
  readonly isMoveModalOpen = signal(false);
  readonly itemToMove = signal<DriveItem | null>(null);
 
  // Share modal state signals
  readonly isShareModalOpen = signal(false);
  readonly itemToShare = signal<DriveItem | null>(null);

  readonly recentItems = signal<DriveItem[]>([]);
  readonly loadingRecent = signal<boolean>(false); 
  readonly loadingMore = signal<boolean>(false);   
 
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
 
  readonly hasMore = computed(() => this.currentPage() + 1 < this.totalPages());
 
  private requestId = 0;
 
  // ---------------------------------------------------------
  // Filters
  // ---------------------------------------------------------
  readonly filtersExpanded = signal(false);
  readonly hasActiveFilters = signal(false);
 
  readonly searchControl = new FormControl<string | null>('');
  readonly extensionControl = new FormControl<string | null>(null);
  readonly sortByControl = new FormControl<string | null>(DEFAULT_SORT);
  readonly directionControl = new FormControl<string | null>(DEFAULT_DIRECTION);
  readonly fromControl = new FormControl<string | null>('');
  readonly toControl = new FormControl<string | null>('');
 
  // Used so each datepicker limits the other 
  readonly fromDate = toSignal(this.fromControl.valueChanges.pipe(map(v => v ?? '')), { initialValue: this.fromControl.value ?? '' });
  readonly toDate = toSignal(this.toControl.valueChanges.pipe(map(v => v ?? '')), { initialValue: this.toControl.value ?? '' });
 
  readonly extensionOptions = [
    { value: 'txt', label: 'Texto (.txt)' },
    { value: 'md', label: 'Markdown (.md)' }
  ];
 
  readonly sortOptions = [
    { value: 'updatedAt', label: 'Última modificación' },
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'name', label: 'Nombre' },
    { value: 'sizeBytes', label: 'Tamaño' }
  ];
 
  readonly directionOptions = [
    { value: 'desc', label: 'Descendente' },
    { value: 'asc', label: 'Ascendente' }
  ];
 
  // Which block to render
  readonly viewState = computed<'loading' | 'list' | 'no-results' | 'no-files'>(() => {
    if (this.loadingRecent()) return 'loading';
    if (this.recentItems().length > 0) return 'list';
    return this.hasActiveFilters() ? 'no-results' : 'no-files';
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
 
    // Any filter change -> back to page 0 (debounced so typing doesn't spam the API)
    merge(
      this.searchControl.valueChanges,
      this.extensionControl.valueChanges,
      this.sortByControl.valueChanges,
      this.directionControl.valueChanges,
      this.fromControl.valueChanges,
      this.toControl.valueChanges
    )
      .pipe(debounceTime(350), takeUntilDestroyed())
      .subscribe(() => this.loadRecentItems());
  }
 
  ngOnInit(): void {
    this.loadRecentItems();
  }
 
 
  // Build query params from the filter controls
  private buildParams(page: number): RecentFilesParams {
    const search = (this.searchControl.value ?? '').trim();
    const extension = this.extensionControl.value as 'txt' | 'md' | null;
 
    return {
      page,
      size: PAGE_SIZE,
      sortBy: (this.sortByControl.value as RecentSortBy) || DEFAULT_SORT,
      direction: (this.directionControl.value as SortDirection) || DEFAULT_DIRECTION,
      search: search || undefined,
      extension: extension || undefined,
      from: this.toIso(this.fromControl.value, false),
      to: this.toIso(this.toControl.value, true)
    };
  }
 
  private toIso(value: string | null, endOfDay: boolean): string | undefined {
    if (!value) return undefined;
    const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }
 
  private computeHasActiveFilters(): boolean {
    return (
      !!(this.searchControl.value ?? '').trim() ||
      !!this.extensionControl.value ||
      !!this.fromControl.value ||
      !!this.toControl.value ||
      (this.sortByControl.value ?? DEFAULT_SORT) !== DEFAULT_SORT ||
      (this.directionControl.value ?? DEFAULT_DIRECTION) !== DEFAULT_DIRECTION
    );
  }
 
  // Loads the first page (used on init, on filter change and after mutations)
  loadRecentItems(): void {
    const currentRequest = ++this.requestId;
 
    this.hasActiveFilters.set(this.computeHasActiveFilters());
    this.loadingRecent.set(true);
    this.loadingMore.set(false);
 
    this.fileService.getRecentFiles(this.buildParams(0)).subscribe({
      next: (response) => {
        if (currentRequest !== this.requestId) return;
 
        this.recentItems.set((response.content || []).map(f => mapFileToDriveItem(f)));
        this.currentPage.set(response.page);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loadingRecent.set(false);
      },
      error: () => {
        if (currentRequest !== this.requestId) return;
 
        this.recentItems.set([]);
        this.currentPage.set(0);
        this.totalPages.set(0);
        this.totalElements.set(0);
        this.loadingRecent.set(false);
      }
    });
  }
 
  // Loads the next page and appends it (called by (loadMore) of app-custom-infinite-scroll)
  loadMoreItems(): void {
    if (this.loadingRecent() || this.loadingMore() || !this.hasMore()) return;
 
    const currentRequest = this.requestId;
    this.loadingMore.set(true);
 
    this.fileService.getRecentFiles(this.buildParams(this.currentPage() + 1)).subscribe({
      next: (response) => {
        if (currentRequest !== this.requestId) return;
 
        const incoming = (response.content || []).map(f => mapFileToDriveItem(f));
 
        this.recentItems.update(list => {
          const knownIds = new Set(list.map(i => i.id));
          return [...list, ...incoming.filter(i => !knownIds.has(i.id))];
        });
 
        this.currentPage.set(response.page);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loadingMore.set(false);
      },
      error: () => {
        if (currentRequest !== this.requestId) return;
        this.loadingMore.set(false);
        this.toastService.error('No se pudieron cargar más archivos.', 'Error');
      }
    });
  }
 
  resetFilters(): void {
    this.searchControl.setValue('');
    this.extensionControl.setValue(null);
    this.sortByControl.setValue(DEFAULT_SORT);
    this.directionControl.setValue(DEFAULT_DIRECTION);
    this.fromControl.setValue('');
    this.toControl.setValue('');
  }
 
  // Actions
  onOpenItem(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
    } else {
      this.router.navigate(['/drive/files/preview', item.id]);
    }
  }
 
  onShare(item: DriveItem): void {
    this.itemToShare.set(item);
    this.isShareModalOpen.set(true);
  }
 
  closeShareModal(): void {
    this.isShareModalOpen.set(false);
    this.itemToShare.set(null);
  }
 
  // Method to navigate to the routed file preview layout
  onPreview(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
      return;
    }
 
    this.router.navigate(['/drive/files/preview', item.id]);
  }
 
  // Method to download the real file
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
 
  // Method to move item to trash
  onDelete(item: DriveItem): void {
    const type = item.type === 'folder' ? 'folders' : 'files';
    this.trashService.moveToTrash(type, item.id).subscribe({
      next: () => {
        this.recentItems.update(list => list.filter(i => i.id !== item.id));
        this.totalElements.update(total => Math.max(0, total - 1));
        this.toastService.success(`Se envió '${item.name}' a la papelera.`, 'Papelera');
      },
      error: (err) => {
        this.toastService.error(err.message || 'Error al mover a la papelera.', 'Error');
      }
    });
  }
 
  // Method to rename from home
  onRename(item: DriveItem): void {
    this.driveAction.openRenameModal(item.id, item.name, item.type);
  }
 
  // Method to move the item
  onMoveItem(item: DriveItem): void {
    this.itemToMove.set(item);
    this.isMoveModalOpen.set(true);
  }
 
  // Method to close the modal
  closeMoveModal(): void {
    this.isMoveModalOpen.set(false);
    this.itemToMove.set(null);
  }
 
  // Method to handle the move target
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
 
  // Method to handle a successful move to the selected target
  private handleMoveTargetSuccess(
    itemName: string,
    targetFolderId: string | null
  ): void {
    const targetLabel = targetFolderId
      ? 'la carpeta seleccionada'
      : 'Mis Documentos';
 
    this.toastService.success(
      `'${itemName}' movido a ${targetLabel}.`,
      'Elemento movido'
    );
 
    this.closeMoveModal();
    this.loadRecentItems();
  }
 
  // Method to handle moving a folder or file into another folder
  handleItemDrop(event: { draggedItem: DriveItem; targetFolder: DriveItem }): void {
    const { draggedItem, targetFolder } = event;
 
    if (draggedItem.type === 'folder') {
      this.folderService.moveFolder(draggedItem.id, {
        targetParentId: targetFolder.id
      }).subscribe({
        next: () => this.handleMoveSuccess(draggedItem, targetFolder),
        error: (err) => this.handleMoveError(err)
      });
 
      return;
    }
 
    this.fileService.moveFile(draggedItem.id, {
      targetFolderId: targetFolder.id
    }).subscribe({
      next: () => this.handleMoveSuccess(draggedItem, targetFolder),
      error: (err) => this.handleMoveError(err)
    });
  }
 
  // Method to handle a successful move
  private handleMoveSuccess(draggedItem: DriveItem, targetFolder: DriveItem): void {
    this.toastService.success(
      `Movido '${draggedItem.name}' a '${targetFolder.name}'`,
      'Elemento movido'
    );
 
    this.loadRecentItems();
  }
 
  // Method to handle the folder/file rename submit
  handleFolderSubmit(newName: string): void {
    const targetId = this.driveAction.folderTargetId();
    if (!targetId) return;
 
    const type = this.folderItemType();
 
    if (type === 'folder') {
      this.folderService.renameFolder(targetId, { name: newName }).subscribe({
        next: () => this.handleRenameSuccess(newName),
        error: (err) => this.handleRenameError(err)
      });
 
      return;
    }
 
    this.fileService.renameFile(targetId, { name: newName }).subscribe({
      next: () => this.handleRenameSuccess(newName),
      error: (err) => this.handleRenameError(err)
    });
  }
 
  // Method to handle a successful rename
  private handleRenameSuccess(newName: string): void {
    this.toastService.success(
      `Actualizado a '${newName}' con éxito.`,
      'Actualizado'
    );
 
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
    this.loadRecentItems();
  }
 
  // Method to handle a rename error
  private handleRenameError(err: ErrorResponse): void {
    this.toastService.error(
      err.message || 'Error al actualizar el nombre.',
      'Error'
    );
  }
 
  // Method to handle a move error
  private handleMoveError(err: ErrorResponse): void {
    this.toastService.error(
      err.message || 'Error al mover el elemento.',
      'Error'
    );
  }
 
  // Close folder modal
  closeFolderModal(): void {
    this.isFolderModalOpen.set(false);
    this.driveAction.closeFolderModal();
  }
}
