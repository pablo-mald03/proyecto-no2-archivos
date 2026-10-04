import { Component, input, output } from '@angular/core';
import { DriveNavOption } from '../drive-nav/constants/drive-nav-option.model';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-drive-nav-item',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './drive-nav-item.html',
  styleUrl: './drive-nav-item.css',
})
//Principal drive nav item
export class DriveNavItem {

  //Props
  option = input.required<DriveNavOption>();
  collapsed = input(false);
  optionSelected = output<void>();
}