import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
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
import { lucideHistory } from '@ng-icons/lucide';
import { ShareModalComponent } from '../../sharing/share-modal-component/share-modal-component';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomButton } from '../../common/custom-button/custom-button';

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
    CustomButton
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

  // Recent items signal
  readonly recentItems = signal<DriveItem[]>([]);
  readonly loadingRecent = signal<boolean>(false);

  readonly lucideHistoryIcon = lucideHistory;

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

  ngOnInit(): void {
    this.loadRecentItems();
  }

  // Fetch recent items from the root folder ordered by updatedAt descending
  loadRecentItems(): void {
    this.loadingRecent.set(true);
    this.folderService.findRootContent().subscribe({
      next: (response) => {
        const folders: DriveItem[] = (response.folders || []).map(f => mapFolderToDriveItem(f));
        const files: DriveItem[] = (response.files || []).map(f => mapFileToDriveItem(f));
        const combined = [...folders, ...files];

        // Sort by updatedAt descending
        combined.sort((a, b) => {
          const timeA = new Date(a.updatedAt).getTime();
          const timeB = new Date(b.updatedAt).getTime();
          return timeB - timeA;
        });

        this.recentItems.set(combined);
        this.loadingRecent.set(false);
      },
      error: () => {
        this.recentItems.set([]);
        this.loadingRecent.set(false);
      }
    });
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