import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DriveBreadcrumb } from '../drive-breadcrumb/drive-breadcrumb';

@Component({
  selector: 'app-drive-explorer-component',
  standalone: true,
  imports: [RouterOutlet, DriveBreadcrumb],
  templateUrl: './drive-explorer-component.html',
  styleUrl: './drive-explorer-component.css',
})
export class DriveExplorerComponent {

}
