import { Component, input, output, signal } from '@angular/core';
import { DriveItemRow } from '../../common/drive-item-row/drive-item-row';
import { DriveItem } from '../../../features/drive/drive-item.model';

@Component({
  selector: 'app-drive-item-list-component',
  standalone: true,
  imports: [DriveItemRow],
  templateUrl: './drive-item-list-component.html',
  styleUrl: './drive-item-list-component.css',
})
export class DriveItemListComponent {
  readonly items = input.required<DriveItem[]>();
  readonly selectedId = signal<string | null>(null);

  // Outputs
  readonly itemClicked = output<DriveItem>();
  readonly itemDoubleClicked = output<DriveItem>();
  readonly shareClicked = output<DriveItem>();
  readonly previewClicked = output<DriveItem>();
  readonly downloadClicked = output<DriveItem>();
  readonly deleteClicked = output<DriveItem>();
  readonly renameClicked = output<DriveItem>();
  readonly itemDropped = output<{ draggedItem: DriveItem; targetFolder: DriveItem }>();
  readonly folderAutoOpened = output<DriveItem>(); 

  private draggedItem: DriveItem | null = null;
  readonly activeTargetFolderId = signal<string | null>(null);
  private hoverTimer: any = null;

  //Method to select the item drageable
  onSelectItem(item: DriveItem): void {
    this.selectedId.set(item.id);
    this.itemClicked.emit(item);
  }

  //Target folder method helper calculator
  isTargetFolder(item: DriveItem): boolean {
    return this.activeTargetFolderId() === item.id && this.draggedItem?.id !== item.id;
  }

  //Floating drag method
  onDragStart(event: DragEvent, item: DriveItem): void {
    this.draggedItem = item;

    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', item.id);
      event.dataTransfer.effectAllowed = 'move';

      const ghostEl = document.createElement('div');
      ghostEl.className = 'flex items-center gap-2 max-w-[180px] px-2.5 py-1.5 bg-surface text-text text-xs font-medium rounded-lg shadow-xl border border-primary/40 backdrop-blur-md pointer-events-none';
      ghostEl.innerHTML = `<span class="h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse"></span><span class="truncate">${item.name}</span>`;
      
      document.body.appendChild(ghostEl);
      event.dataTransfer.setDragImage(ghostEl, 15, 15);

      setTimeout(() => document.body.removeChild(ghostEl), 0);
    }
  }

  //Method to drag over
  onDragOver(event: DragEvent, item: DriveItem): void {
    if (item.type === 'folder' && this.draggedItem?.id !== item.id) {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

      if (this.activeTargetFolderId() !== item.id) {
        this.activeTargetFolderId.set(item.id);

        if (this.hoverTimer) clearTimeout(this.hoverTimer);

        this.hoverTimer = setTimeout(() => {
          this.folderAutoOpened.emit(item); 
          this.resetDragState();
        }, 900);
      }
    }
  }

  //Method when the drag leave the field
  onDragLeave(item: DriveItem): void {
    if (this.activeTargetFolderId() === item.id) {
      this.resetHoverTimer();
    }
  }

  //Method to excecute the drop into the folder
  onDrop(event: DragEvent, targetItem: DriveItem): void {
    event.preventDefault();
    event.stopPropagation();
    this.resetHoverTimer();

    if (this.draggedItem && targetItem.type === 'folder' && this.draggedItem.id !== targetItem.id) {
      this.itemDropped.emit({ draggedItem: this.draggedItem, targetFolder: targetItem });
    }

    this.resetDragState();
  }

  private resetHoverTimer(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    this.activeTargetFolderId.set(null);
  }

  private resetDragState(): void {
    this.resetHoverTimer();
    this.draggedItem = null;
  }
}