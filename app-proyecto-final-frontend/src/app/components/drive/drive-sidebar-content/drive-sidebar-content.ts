import { Component, input, output } from '@angular/core';
import { DriveNewButton } from '../drive-new-button/drive-new-button';
import { DriveNav } from '../drive-nav/drive-nav';
import { DriveUserCard } from '../drive-user-card/drive-user-card';
import { StorageWidget } from '../../storage/storage-widget/storage-widget';

@Component({
  selector: 'app-drive-sidebar-content',
  imports: [DriveNewButton, DriveNav, DriveUserCard, StorageWidget],
  templateUrl: './drive-sidebar-content.html',
  styleUrl: './drive-sidebar-content.css',
})
//Principal drive sidebar content component
export class DriveSidebarContent {
  collapsed = input(false);

  optionSelected = output<void>();
  uploadClicked = output<void>();
  folderClicked = output<void>();
  logoutClicked = output<void>();
}