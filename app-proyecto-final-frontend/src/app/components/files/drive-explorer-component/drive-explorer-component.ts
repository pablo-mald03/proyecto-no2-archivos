import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DriveBreadcrumb } from '../drive-breadcrumb/drive-breadcrumb';
import { BreadcrumbItem } from '../constants/breadcrum-item';
import { filter } from 'rxjs';

@Component({
  selector: 'app-drive-explorer-component',
  standalone: true,
  imports: [RouterOutlet, DriveBreadcrumb],
  templateUrl: './drive-explorer-component.html',
  host: { class: 'flex flex-col h-full min-h-0' }
})
export class DriveExplorerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly breadcrumbItems = signal<BreadcrumbItem[]>([]);

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateBreadcrumbs();
    });

    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    const folderId = this.route.firstChild?.snapshot.paramMap.get('id');
    
    if (!folderId) {
      this.breadcrumbItems.set([]);
      return;
    }

    //MOCK
    if (folderId === '1') {
      this.breadcrumbItems.set([{ label: 'Documentación del Proyecto' }]);
    } else if (folderId === '2') {
      this.breadcrumbItems.set([{ label: 'Carpeta Personal' }]);
    } else if (folderId === '1-2') {
      this.breadcrumbItems.set([
        { label: 'Documentación del Proyecto', route: '/drive/files/folder/1' },
        { label: 'Subcarpeta Backend' }
      ]);
    } else {
      this.breadcrumbItems.set([{ label: 'Carpeta' }]);
    }
  }
}