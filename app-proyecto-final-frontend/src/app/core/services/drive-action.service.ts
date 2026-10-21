import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DriveActionService {
  readonly uploadTriggered = signal<boolean>(false);

  readonly folderModalOpen = signal<boolean>(false);
  readonly folderModalMode = signal<'create' | 'rename'>('create');
  readonly folderItemType = signal<'folder' | 'file'>('folder');
  readonly folderInitialName = signal<string>('');
  readonly folderTargetId = signal<string | null>(null);

  // Signal for the context menu open
  readonly activeContextMenuId = signal<string | null>(null);

  // Trigger for open the modal
  triggerUpload(): void {
    this.uploadTriggered.set(true);
    setTimeout(() => this.uploadTriggered.set(false), 50);
  }

  // Method to open the create form modal
  openCreateFolderModal(): void {
    this.folderModalMode.set('create');
    this.folderItemType.set('folder');
    this.folderInitialName.set('');
    this.folderTargetId.set(null);
    this.folderModalOpen.set(true);
  }

  // Method to open the rename form modal
  openRenameModal(id: string, currentName: string, type: 'folder' | 'file'): void {
    this.folderModalMode.set('rename');
    this.folderItemType.set(type);
    this.folderInitialName.set(currentName);
    this.folderTargetId.set(id);
    this.folderModalOpen.set(true);
  }

  // Close modal
  closeFolderModal(): void {
    this.folderModalOpen.set(false);
  }

  //Method for the control for the menu
  setActiveContextMenu(id: string | null): void {
    this.activeContextMenuId.set(id);
  }

  //Hook to close all the context menus
  closeAllContextMenus(): void {
    this.activeContextMenuId.set(null);
  }
}