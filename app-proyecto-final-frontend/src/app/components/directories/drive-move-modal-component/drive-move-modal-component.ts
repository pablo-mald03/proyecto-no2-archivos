import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { DriveItem, mapFolderToDriveItem } from '../../../features/drive/drive-item.model';
import { lucideArrowLeft, lucideChevronRight, lucideFolder } from '@ng-icons/lucide';
import { FolderService } from '../../../features/folders/service/folder.service';

@Component({
  selector: 'app-drive-move-modal-component',
  standalone: true,
  imports: [CommonModule, CustomModalComponent, CustomButton, NgIconComponent],
  templateUrl: './drive-move-modal-component.html',
  styleUrl: './drive-move-modal-component.css',
})
//Drive move modal component
export class DriveMoveModalComponent {
  private readonly folderService = inject(FolderService);

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
        this.breadcrumbs.set([{ id: null, name: 'Raíz' }]);
        this.navigateTo(null, 'Mis Documentos');
      }
    });
  }

  // Fetch real subfolders based on parent ID
  navigateTo(folderId: string | null, folderName: string): void {
    this.loading.set(true);
    this.currentFolderId.set(folderId);
    this.currentFolderName.set(folderName);

    const request$ = folderId
      ? this.folderService.findFolderContent(folderId)
      : this.folderService.findRootContent();

    request$.subscribe({
      next: (response) => {
        const folderList = Array.isArray(response.folders) ? response.folders : (response.folders?.content || []);
        const folders: DriveItem[] = folderList.map(f => mapFolderToDriveItem(f));
        const activeItem = this.itemToMove();
        // Prevent moving a folder inside itself
        const filtered = folders.filter(f => f.id !== activeItem?.id);

        this.subFolders.set(filtered);
        this.loading.set(false);
      },
      error: () => {
        this.subFolders.set([]);
        this.loading.set(false);
      }
    });
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