import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import {
  lucideCalendar, lucideChevronDown, lucideInfo, lucideRotateCcw,
  lucideSearch, lucideSlidersHorizontal, lucideUsers
} from '@ng-icons/lucide';
import { debounceTime, merge } from 'rxjs';

import { ShareService } from '../../../features/shares/service/share.service';
import { FileService } from '../../../features/files/service/file.service';
import { ToastService } from '../../../core/services/toast.service';
import { SharedWithMeItem } from '../../../features/shares/models/response/shared-with-me-item.model';
import { DriveItem, mapSharedWithMeToDriveItem } from '../../../features/drive/drive-item.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { SharedWithMeQueryParams } from '../../../features/shares/models/request/shared-with-me-query.model';

import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
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
    CustomInfiniteScroll,
    DriveItemListComponent,
    EmptyStateComponent,
    CustomAlert
  ],
  templateUrl: './shared-with-me-page.html',
  styleUrl: './shared-with-me-page.css',
  host: { class: 'block h-full min-h-0' }
})
// Principal Shared With Me Page
export class SharedWithMePage implements OnInit {
  // Dependencies
  private readonly shareService = inject(ShareService);
  private readonly fileService = inject(FileService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Pagination & Loading State
  readonly pageSize = 15;
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly hasMore = computed(() => this.currentPage() + 1 < this.totalPages());

  readonly items = signal<DriveItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly loadingMore = signal<boolean>(false);
  readonly initialized = signal<boolean>(false);

  // Filters state
  readonly filtersExpanded = signal<boolean>(false);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly typeFilterControl = new FormControl<'FILE' | 'FOLDER' | ''>('', { nonNullable: true });
  readonly accessFilterControl = new FormControl<'VIEWER' | 'COMMENTER' | 'EDITOR' | ''>('', { nonNullable: true });
  readonly sortByControl = new FormControl<string>('updatedAt', { nonNullable: true });
  readonly directionControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });
  readonly extensionControl = new FormControl<string>('', { nonNullable: true });
  readonly fromControl = new FormControl<string>('', { nonNullable: true });
  readonly toControl = new FormControl<string>('', { nonNullable: true });

  // Filter options
  readonly typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'FOLDER', label: 'Carpetas' },
    { value: 'FILE', label: 'Archivos' }
  ];

  readonly accessOptions = [
    { value: '', label: 'Todos los permisos' },
    { value: 'VIEWER', label: 'Solo lectura (Lector)' },
    { value: 'COMMENTER', label: 'Comentarios (Comentador)' },
    { value: 'EDITOR', label: 'Edición (Editor)' }
  ];

  readonly sortByOptions = [
    { value: 'updatedAt', label: 'Última modificación' },
    { value: 'name', label: 'Nombre' },
    { value: 'sizeBytes', label: 'Tamaño' },
    { value: 'createdAt', label: 'Fecha de compartición' }
  ];

  readonly directionOptions = [
    { value: 'desc', label: 'Descendente' },
    { value: 'asc', label: 'Ascendente' }
  ];

  readonly extensionOptions = [
    { value: '', label: 'Todas las extensiones' },
    { value: 'txt', label: 'Texto (.txt)' },
    { value: 'md', label: 'Markdown (.md)' },
    { value: 'pdf', label: 'PDF (.pdf)' },
    { value: 'png', label: 'Imagen (.png)' },
    { value: 'jpg', label: 'Imagen (.jpg)' }
  ];

  // Active filters helper
  readonly hasActiveFilters = computed(() => {
    return !!(
      this.searchControl.value.trim() ||
      this.typeFilterControl.value ||
      this.accessFilterControl.value ||
      this.extensionControl.value ||
      this.fromControl.value ||
      this.toControl.value ||
      this.sortByControl.value !== 'updatedAt' ||
      this.directionControl.value !== 'desc'
    );
  });

  // Empty state condition
  readonly emptyStateType = computed<'loading' | 'shared-empty' | 'search-empty' | 'none'>(() => {
    if (!this.initialized() || (this.loading() && this.items().length === 0)) return 'loading';
    if (this.items().length === 0 && this.hasActiveFilters()) return 'search-empty';
    if (this.items().length === 0) return 'shared-empty';
    return 'none';
  });

  // Icons
  readonly lucideUsersIcon = lucideUsers;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideInfoIcon = lucideInfo;
  readonly lucideCalendarIcon = lucideCalendar;

  constructor() {
    merge(
      this.searchControl.valueChanges.pipe(debounceTime(350)),
      this.typeFilterControl.valueChanges,
      this.accessFilterControl.valueChanges,
      this.extensionControl.valueChanges,
      this.sortByControl.valueChanges,
      this.directionControl.valueChanges,
      this.fromControl.valueChanges.pipe(debounceTime(300)),
      this.toControl.valueChanges.pipe(debounceTime(300))
    ).subscribe(() => {
      this.fetchItems({ reset: true });
    });
  }

  ngOnInit(): void {
    this.fetchItems({ reset: true });
  }

  // Public refresh shortcut for template
  refresh(): void { this.fetchItems({ reset: true }); }

  // Method to fetch shared-with-me items with server-side pagination and filters
  fetchItems({ reset = false }: { reset?: boolean } = {}): void {
    const targetPage = reset ? 0 : this.currentPage() + 1;

    if (reset) {
      this.loading.set(true);
      this.initialized.set(false);
    } else {
      this.loadingMore.set(true);
    }

    const query: SharedWithMeQueryParams = {
      page: targetPage,
      size: this.pageSize,
      direction: this.directionControl.value,
      sortBy: this.sortByControl.value || undefined,
      search: this.searchControl.value.trim() || undefined,
      type: (this.typeFilterControl.value as 'FILE' | 'FOLDER') || undefined,
      extension: this.extensionControl.value || undefined,
      access: (this.accessFilterControl.value as 'VIEWER' | 'COMMENTER' | 'EDITOR') || undefined,
      from: this.fromControl.value || undefined,
      to: this.toControl.value || undefined
    };

    this.shareService.getSharedWithMe(query).subscribe({
      next: (response) => {
        const mapped = (response.content || []).map(item => mapSharedWithMeToDriveItem(item));

        this.totalPages.set(response.totalPages ?? 0);
        this.totalElements.set(response.totalElements ?? 0);
        this.currentPage.set(targetPage);

        if (reset) {
          this.items.set(mapped);
          this.loading.set(false);
          this.initialized.set(true);
        } else {
          this.items.update(prev => [...prev, ...mapped]);
          this.loadingMore.set(false);
        }
      },
      error: (err: ErrorResponse) => {
        if (reset) {
          this.items.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
          this.loading.set(false);
          this.initialized.set(true);
        } else {
          this.loadingMore.set(false);
        }
        this.toastService.error(err.message || 'Error al cargar los elementos compartidos.', 'Error');
      }
    });
  }

  // Load next page on scroll bottom reached
  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;
    this.fetchItems({ reset: false });
  }

  // Reset all filters
  resetFilters(): void {
    this.searchControl.setValue('');
    this.typeFilterControl.setValue('');
    this.accessFilterControl.setValue('');
    this.extensionControl.setValue('');
    this.sortByControl.setValue('updatedAt');
    this.directionControl.setValue('desc');
    this.fromControl.setValue('');
    this.toControl.setValue('');
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