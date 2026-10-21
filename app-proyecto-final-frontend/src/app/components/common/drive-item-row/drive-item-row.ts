import { Component, computed, effect, HostListener, inject, input, output, signal } from '@angular/core';
import { DriveItem } from '../../../features/drive/drive-item.model';
import { lucideDownload, lucideEye, lucideFileCode, lucideFileText, lucideFolder, lucideGitCompareArrows, lucideGripVertical, lucideMapPlus, lucideMenu, lucideOption, lucidePencil, lucideProportions, lucideRotateCcw, lucideShare2, lucideTrash2 } from '@ng-icons/lucide';
import { CustomToggleMenu } from '../custom-toggle-menu/custom-toggle-menu';
import { CustomToggleMenuItem } from '../custom-toggle-menu-item/custom-toggle-menu-item';
import { NgIcon } from '@ng-icons/core';
import { DatePipe } from '@angular/common';
import { DriveActionService } from '../../../core/services/drive-action.service';

@Component({
  selector: 'app-drive-item-row',
  standalone: true,
  imports: [
    DatePipe,
    NgIcon,
    CustomToggleMenu,
    CustomToggleMenuItem
  ],
  templateUrl: './drive-item-row.html',
  styleUrl: './drive-item-row.css',
})
//Principal drive item row component
export class DriveItemRow {
  private readonly driveAction = inject(DriveActionService);

  // Inputs & Outputs
  readonly item = input.required<DriveItem>();
  readonly isSelected = input(false);
  readonly mode = input<'default' | 'trash' | 'shared'>('default');

  readonly dateFormat = 'dd MMM y, HH:mm';

  
  // Computed access level label for shared items
  readonly accessLabel = computed(() => {
    const access = this.item().access;
    if (!access) return null;
    switch (access) {
      case 'VIEWER': return 'Lector';
      case 'COMMENTER': return 'Comentador';
      case 'EDITOR': return 'Editor';
      default: return access;
    }
  });

  readonly itemClicked = output<DriveItem>();
  readonly itemDoubleClicked = output<DriveItem>();
  readonly shareClicked = output<DriveItem>();
  readonly previewClicked = output<DriveItem>();
  readonly downloadClicked = output<DriveItem>();
  readonly deleteClicked = output<DriveItem>();
  readonly renameClicked = output<DriveItem>();
  readonly dragStartHandle = output<DragEvent>();
  readonly moveClicked = output<DriveItem>();
  readonly restoreClicked = output<DriveItem>();
  readonly permanentDeleteClicked = output<DriveItem>();

  // State for Context Menu 
  readonly contextMenuOpen = signal(false);
  readonly menuPosition = signal({ x: 0, y: 0 });

  // Icons
  readonly lucideFolderIcon = lucideFolder;
  readonly lucideFileTextIcon = lucideFileText;
  readonly lucideFileCodeIcon = lucideFileCode;
  readonly lucideShareIcon = lucideShare2;
  readonly lucideEyeIcon = lucideEye;
  readonly lucideMoreIcon = lucideMenu;
  readonly lucideDownloadIcon = lucideDownload;
  readonly lucideTrashIcon = lucideTrash2;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucidePencilIcon = lucidePencil;
  readonly lucideGripVerticalIcon = lucideGripVertical;
  readonly lucideFolderInputIcon = lucideFolder;

  constructor() {
    effect(() => {
      const activeId = this.driveAction.activeContextMenuId();
      if (activeId !== this.item().id && this.contextMenuOpen()) {
        this.contextMenuOpen.set(false);
      }
    });
  }

  // Global listener for documen click
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.contextMenuOpen()) {
      this.closeContextMenu();
    }
  }

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

    this.driveAction.setActiveContextMenu(this.item().id);

    const ESTIMATED_MENU_WIDTH = 200;
    const ESTIMATED_MENU_HEIGHT = 220;
    const PADDING = 12;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = event.clientX;
    let y = event.clientY;

    if (x + ESTIMATED_MENU_WIDTH > viewportWidth) {
      x = Math.max(PADDING, x - ESTIMATED_MENU_WIDTH);
    }

    if (y + ESTIMATED_MENU_HEIGHT > viewportHeight) {
      y = Math.max(PADDING, y - ESTIMATED_MENU_HEIGHT);
    }

    this.menuPosition.set({ x, y });
    this.contextMenuOpen.set(true);
  }

  //Signal to close the context menu
  closeContextMenu(): void {
    this.contextMenuOpen.set(false);
    if (this.driveAction.activeContextMenuId() === this.item().id) {
      this.driveAction.setActiveContextMenu(null);
    }
  }
}