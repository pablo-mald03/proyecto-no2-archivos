import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
//Principal service to trow the signal to upload a new file
export class DriveActionService {
  readonly uploadTriggered = signal<boolean>(false);

  readonly folderModalOpen = signal<boolean>(false);
  readonly folderModalMode = signal<'create' | 'rename'>('create');
  readonly folderItemType = signal<'folder' | 'file'>('folder');
  readonly folderInitialName = signal<string>('');
  readonly folderTargetId = signal<string | null>(null);

  //Trigger the upload action method
  triggerUpload(): void {
    this.uploadTriggered.set(true);
    setTimeout(() => this.uploadTriggered.set(false), 50);
  }

  //Create folder modal method
  openCreateFolderModal(): void {
    this.folderModalMode.set('create');
    this.folderItemType.set('folder');
    this.folderInitialName.set('');
    this.folderTargetId.set(null);
    this.folderModalOpen.set(true);
  }

  // Rename modal signal method
  openRenameModal(id: string, currentName: string, type: 'folder' | 'file'): void {
    this.folderModalMode.set('rename');
    this.folderItemType.set(type);
    this.folderInitialName.set(currentName);
    this.folderTargetId.set(id);
    this.folderModalOpen.set(true);
  }

  closeFolderModal(): void {
    this.folderModalOpen.set(false);
  }
}