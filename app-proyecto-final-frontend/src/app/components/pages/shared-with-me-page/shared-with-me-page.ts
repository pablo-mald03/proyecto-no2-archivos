import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { lucideChevronDown, lucideInfo, lucideRotateCcw, lucideSearch, lucideSlidersHorizontal, lucideUsers } from '@ng-icons/lucide';

import { ShareService } from '../../../features/shares/service/share.service';
import { FileService } from '../../../features/files/service/file.service';
import { ToastService } from '../../../core/services/toast.service';
import { SharedWithMeItem } from '../../../features/shares/models/response/shared-with-me-item.model';
import { DriveItem, mapSharedWithMeToDriveItem } from '../../../features/drive/drive-item.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';

import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { DriveItemListComponent } from '../../drive/drive-item-list-component/drive-item-list-component';
import { EmptyStateComponent } from '../../common/empty-state-component/empty-state-component';
import { CustomAlert } from '../../common/custom-alert/custom-alert';

@Component({
  selector: 'app-shared-with-me-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIconComponent,
    CustomCard,
    CustomButton,
    CustomTextfield,
    CustomDropdown,
    DriveItemListComponent,
    EmptyStateComponent,
    CustomAlert
  ],
  templateUrl: './shared-with-me-page.html',
  styleUrl: './shared-with-me-page.css',
  host: { class: 'flex flex-col h-full min-h-0 overflow-y-auto pr-2' }
})
// Principal Shared With Me Page component to view and interact with shared files/folders
export class SharedWithMePage implements OnInit {
  // Dependencies
  private readonly shareService = inject(ShareService);
  private readonly fileService = inject(FileService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Data signals
  readonly rawItems = signal<SharedWithMeItem[]>([]);
  readonly loading = signal<boolean>(false);

  // Filters state using FormControls for CustomDropdown compatibility
  readonly filtersExpanded = signal<boolean>(false);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly typeFilterControl = new FormControl<string>('ALL', { nonNullable: true });
  readonly accessFilterControl = new FormControl<string>('ALL', { nonNullable: true });
  readonly sortOptionControl = new FormControl<string>('updatedAt_desc', { nonNullable: true });

  // Filter options
  readonly typeOptions = [
    { value: 'ALL', label: 'Todos los tipos' },
    { value: 'FOLDER', label: 'Carpetas' },
    { value: 'FILE', label: 'Archivos' }
  ];

  readonly accessOptions = [
    { value: 'ALL', label: 'Todos los permisos' },
    { value: 'VIEWER', label: 'Solo lectura (Lector)' },
    { value: 'COMMENTER', label: 'Comentarios (Comentador)' },
    { value: 'EDITOR', label: 'Edición (Editor)' }
  ];

  readonly sortOptions = [
    { value: 'updatedAt_desc', label: 'Modificado (más reciente)' },
    { value: 'updatedAt_asc', label: 'Modificado (más antiguo)' },
    { value: 'name_asc', label: 'Nombre (A - Z)' },
    { value: 'name_desc', label: 'Nombre (Z - A)' },
    { value: 'size_desc', label: 'Tamaño (mayor a menor)' },
    { value: 'size_asc', label: 'Tamaño (menor a mayor)' }
  ];

  // Icons
  readonly lucideUsersIcon = lucideUsers;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideInfoIcon = lucideInfo;

  ngOnInit(): void {
    this.loadSharedItems();
  }

  // Method to load items shared with current user
  loadSharedItems(): void {
    this.loading.set(true);
    this.shareService.getSharedWithMe().subscribe({
      next: (items) => {
        this.rawItems.set(items || []);
        this.loading.set(false);
      },
      error: (err: ErrorResponse) => {
        this.rawItems.set([]);
        this.loading.set(false);
        this.toastService.error(
          err.message || 'Error al cargar los elementos compartidos.',
          'Error'
        );
      }
    });
  }

  // Computed property for filtered and sorted representation
  readonly displayedItems = computed<DriveItem[]>(() => {
    let list = this.rawItems().map(item => mapSharedWithMeToDriveItem(item));

    const search = this.searchControl.value.trim().toLowerCase();
    if (search) {
      list = list.filter(item => item.name.toLowerCase().includes(search));
    }

    const type = this.typeFilterControl.value;
    if (type === 'FOLDER') {
      list = list.filter(item => item.type === 'folder');
    } else if (type === 'FILE') {
      list = list.filter(item => item.type === 'file');
    }

    const access = this.accessFilterControl.value;
    if (access !== 'ALL') {
      list = list.filter(item => item.access === access);
    }

    const sort = this.sortOptionControl.value;
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'updatedAt_desc': {
          const tA = new Date(a.updatedAt).getTime();
          const tB = new Date(b.updatedAt).getTime();
          return tB - tA;
        }
        case 'updatedAt_asc': {
          const tA = new Date(a.updatedAt).getTime();
          const tB = new Date(b.updatedAt).getTime();
          return tA - tB;
        }
        case 'name_asc':
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        case 'name_desc':
          return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
        case 'size_desc':
          return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        case 'size_asc':
          return (a.sizeBytes || 0) - (b.sizeBytes || 0);
        default:
          return 0;
      }
    });

    return list;
  });

  // Method for empty state condition
  readonly emptyStateType = computed<'loading' | 'shared-empty' | 'search-empty' | 'none'>(() => {
    if (this.loading()) return 'loading';
    if (this.rawItems().length === 0) return 'shared-empty';
    if (this.displayedItems().length === 0) return 'search-empty';
    return 'none';
  });

  // Reset all filters
  resetFilters(): void {
    this.searchControl.setValue('');
    this.typeFilterControl.setValue('ALL');
    this.accessFilterControl.setValue('ALL');
    this.sortOptionControl.setValue('updatedAt_desc');
  }

  // Open item when clicked or double clicked
  onOpenItem(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
    } else {
      this.router.navigate(['/drive/files/preview', item.id]);
    }
  }

  // Preview file item
  onPreview(item: DriveItem): void {
    if (item.type === 'folder') {
      this.router.navigate(['/drive/files/folder', item.id]);
      return;
    }

    this.router.navigate(['/drive/files/preview', item.id]);
  }

  // Download file item
  onDownload(item: DriveItem): void {
    if (item.type === 'folder') return;

    this.fileService.downloadFile(item.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.toastService.success(`Descargando ${item.name}...`, 'Descarga');
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(
          err.message || 'Error al descargar el archivo.',
          'Error'
        );
      }
    });
  }
}