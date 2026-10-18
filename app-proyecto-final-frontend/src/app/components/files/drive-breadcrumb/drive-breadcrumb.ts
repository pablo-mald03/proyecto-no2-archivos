import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { BreadcrumbItem } from '../constants/breadcrum-item';
import { lucideChevronRight, lucideHouse } from '@ng-icons/lucide';

@Component({
  selector: 'app-drive-breadcrumb',
  standalone: true,
  imports: [RouterLink, NgIcon],
  templateUrl: './drive-breadcrumb.html',
  styleUrl: './drive-breadcrumb.css',
})
//Principal drive bradcrumb component
export class DriveBreadcrumb {
  readonly items = input.required<BreadcrumbItem[]>();

  readonly lucideHomeIcon = lucideHouse;
  readonly lucideChevronRightIcon = lucideChevronRight;
}