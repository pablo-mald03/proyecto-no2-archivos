import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { DriveSidebarContent } from '../drive-sidebar-content/drive-sidebar-content';
import { StorageWidget } from '../../storage/storage-widget/storage-widget';

@Component({
  selector: 'app-drive-mobile-sidebar',
  imports: [NgIcon, DriveSidebarContent, StorageWidget],
  templateUrl: './drive-mobile-sidebar.html',
  styleUrl: './drive-mobile-sidebar.css',
})
export class DriveMobileSidebar {
  readonly lucideXIcon = lucideX;

  open = input(false);

  closed = output<void>();
  uploadClicked = output<void>();
  folderClicked = output<void>();
  logoutClicked = output<void>();

  //Principal method to emit the upload action
  upload(): void {
    this.closed.emit();
    this.uploadClicked.emit();
  }

  //Principal method to emit the new folder upload action
  newFolder(): void {
    this.closed.emit();
    this.folderClicked.emit();
  }
}