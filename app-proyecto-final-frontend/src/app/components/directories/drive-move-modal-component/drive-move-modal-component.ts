import { Component, effect, input, output, signal } from '@angular/core';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { DriveItem } from '../../../features/drive/drive-item.model';
import { lucideArrowLeft, lucideChevronRight, lucideFolder } from '@ng-icons/lucide';

@Component({
  selector: 'app-drive-move-modal-component',
  standalone: true,
  imports: [CommonModule, CustomModalComponent, CustomButton, NgIconComponent],
  templateUrl: './drive-move-modal-component.html',
  styleUrl: './drive-move-modal-component.css',
})
//Drive move modal component
export class DriveMoveModalComponent {
  // Component Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly itemToMove = input<DriveItem | null>(null);

  readonly closed = output<void>();
  readonly targetSelected = output<string | null>();

  // Navigation state signals
  readonly currentFolderId = signal<string | null>(null);
  readonly currentFolderName = signal<string>('Mis Documentos');
  readonly breadcrumbs = signal<{ id: string | null; name: string }[]>([
    { id: null, name: 'Raíz' }
  ]);

  readonly subFolders = signal<DriveItem[]>([]);
  readonly loading = signal<boolean>(false);

  // Icons mapping
  readonly lucideFolderIcon = lucideFolder;
  readonly lucideChevronRightIcon = lucideChevronRight;
  readonly lucideArrowLeftIcon = lucideArrowLeft;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.navigateTo(null, 'Mis Documentos');
      }
    });
  }

  // Fetch mock subfolders based on parent ID
  navigateTo(folderId: string | null, folderName: string): void {
    this.loading.set(true);
    this.currentFolderId.set(folderId);
    this.currentFolderName.set(folderName);

    setTimeout(() => {
      let folders: DriveItem[] = [];

      if (!folderId) {
        folders = [
          { id: '1', name: 'Documentación del Proyecto', type: 'folder', updatedAt: new Date() },
          { id: '2', name: 'Carpeta Personal', type: 'folder', updatedAt: new Date() }
        ];
      } else if (folderId === '1') {
        folders = [
          { id: '1-2', name: 'Subcarpeta Backend', type: 'folder', updatedAt: new Date() }
        ];
      } else {
        folders = [];
      }

      const activeItem = this.itemToMove();
      const filtered = folders.filter(f => f.id !== activeItem?.id);

      this.subFolders.set(filtered);
      this.loading.set(false);
    }, 250);
  }

  // Enter into a subfolder
  openFolder(folder: DriveItem): void {
    const currentCrumb = { id: folder.id, name: folder.name };
    this.breadcrumbs.update(crumbs => [...crumbs, currentCrumb]);
    this.navigateTo(folder.id, folder.name);
  }

  // Go back up in navigation breadcrumbs
  goBack(): void {
    const crumbs = this.breadcrumbs();
    if (crumbs.length > 1) {
      const newCrumbs = crumbs.slice(0, crumbs.length - 1);
      const parent = newCrumbs[newCrumbs.length - 1];
      this.breadcrumbs.set(newCrumbs);
      this.navigateTo(parent.id, parent.name);
    }
  }

  // Confirm destination
  onConfirmMove(): void {
    const targetId = this.currentFolderId();
    if (this.itemToMove()?.id === targetId) return;

    this.targetSelected.emit(targetId);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}