import { Component, computed, input, output, signal } from '@angular/core';
import { DriveItem } from '../../../features/drive/drive-item.model';
import { lucideDownload, lucideEye, lucideFileCode, lucideFileText, lucideFolder, lucideMapPlus, lucideShare2, lucideTrash2 } from '@ng-icons/lucide';
import { CustomToggleMenu } from '../custom-toggle-menu/custom-toggle-menu';
import { CustomToggleMenuItem } from '../custom-toggle-menu-item/custom-toggle-menu-item';
import { NgIcon } from '@ng-icons/core';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-drive-item-row',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    NgIcon,
    CustomToggleMenu,
    CustomToggleMenuItem
  ],
  templateUrl: './drive-item-row.html',
  styleUrl: './drive-item-row.css',
})
export class DriveItemRow {
  // Inputs & Outputs
  readonly item = input.required<DriveItem>();
  readonly isSelected = input(false);

  readonly itemClicked = output<DriveItem>();
  readonly itemDoubleClicked = output<DriveItem>();
  readonly shareClicked = output<DriveItem>();
  readonly previewClicked = output<DriveItem>();
  readonly downloadClicked = output<DriveItem>();
  readonly deleteClicked = output<DriveItem>();

  // State for Context Menu 
  readonly contextMenuOpen = signal(false);
  readonly menuPosition = signal({ x: 0, y: 0 });

  // Icons
  readonly lucideFolderIcon = lucideFolder;
  readonly lucideFileTextIcon = lucideFileText;
  readonly lucideFileCodeIcon = lucideFileCode;
  readonly lucideShareIcon = lucideShare2;
  readonly lucideEyeIcon = lucideEye;
  readonly lucideMoreIcon = lucideMapPlus;
  readonly lucideDownloadIcon = lucideDownload;
  readonly lucideTrashIcon = lucideTrash2;

  // Icon type computed logic
  readonly itemIcon = computed(() => {
    const current = this.item();
    if (current.type === 'folder') return this.lucideFolderIcon;
    if (current.extension === 'md') return this.lucideFileCodeIcon;
    return this.lucideFileTextIcon;
  });

  // Human readable size formatting
  readonly formattedSize = computed(() => {
    const bytes = this.item().sizeBytes;
    if (!bytes && bytes !== 0) return '—';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  });

  // Handle right click to open context menu at cursor position
  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.menuPosition.set({ x: event.clientX, y: event.clientY });
    this.contextMenuOpen.set(true);
  }

  closeContextMenu(): void {
    this.contextMenuOpen.set(false);
  }
}