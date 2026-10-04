import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { DriveSidebarContent } from '../drive-sidebar-content/drive-sidebar-content';

@Component({
  selector: 'app-drive-sidebar',
  imports: [NgIcon, DriveSidebarContent],
  templateUrl: './drive-sidebar.html',
  styleUrl: './drive-sidebar.css',
})
//Principal drive sidebar component for desktop
export class DriveSidebar {
  readonly lucideChevronLeftIcon = lucideChevronLeft;
  readonly lucideChevronRightIcon = lucideChevronRight;

  collapsed = input(false);

  toggle = output<void>();
  uploadClicked = output<void>();
  folderClicked = output<void>();
  logoutClicked = output<void>();
}