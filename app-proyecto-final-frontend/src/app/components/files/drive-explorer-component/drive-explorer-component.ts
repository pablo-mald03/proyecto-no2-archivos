import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DriveBreadcrumb } from '../drive-breadcrumb/drive-breadcrumb';
import { BreadcrumbItem } from '../constants/breadcrum-item';
import { filter } from 'rxjs';
import { FolderService } from '../../../features/folders/service/folder.service';

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
  private readonly folderService = inject(FolderService);

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

    this.folderService.findFolderContent(folderId).subscribe({
      next: (response) => {
        const crumbs: BreadcrumbItem[] = (response.breadcrumbs || []).map((b, index, arr: typeof response.breadcrumbs) => ({
          label: b.name,
          route: index < arr.length - 1 ? `/drive/files/folder/${b.id}` : undefined
        }));
        this.breadcrumbItems.set(crumbs);
      },
      error: () => {
        this.breadcrumbItems.set([{ label: 'Carpeta' }]);
      }
    });
  }
}