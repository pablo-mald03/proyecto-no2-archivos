import { Component, input, output } from '@angular/core';
import { DriveNewButton } from '../drive-new-button/drive-new-button';
import { DriveNav } from '../drive-nav/drive-nav';
import { DriveUserCard } from '../drive-user-card/drive-user-card';

@Component({
  selector: 'app-drive-sidebar-content',
  imports: [DriveNewButton, DriveNav, DriveUserCard],
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