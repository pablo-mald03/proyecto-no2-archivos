import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import {
  lucideCalendar, lucideChevronDown, lucideInfo, lucideRotateCcw,
  lucideSearch, lucideSlidersHorizontal, lucideTrash2
} from '@ng-icons/lucide';
import { debounceTime, merge } from 'rxjs';

import { TrashService } from '../../../features/trash/service/trash.service';
import { ToastService } from '../../../core/services/toast.service';
import { TrashItem } from '../../../features/trash/models/trash-item.model';
import { DriveItem, mapTrashItemToDriveItem } from '../../../features/drive/drive-item.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ConfirmDialogType } from '../../common/custom-confirm-dialog/types/confirm-dialog.types';
import { TrashQueryParams } from '../../../features/trash/models/request/trash-query.model';

import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomConfirmDialog } from '../../common/custom-confirm-dialog/custom-confirm-dialog';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { DriveItemListComponent } from '../../drive/drive-item-list-component/drive-item-list-component';
import { EmptyStateComponent } from '../../common/empty-state-component/empty-state-component';
import { CustomAlert } from '../../common/custom-alert/custom-alert';

@Component({
  selector: 'app-trash-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIconComponent,
    CustomCard,
    CustomButton,
    CustomTextfield,
    CustomDropdown,
    CustomConfirmDialog,
    CustomInfiniteScroll,
    DriveItemListComponent,
    EmptyStateComponent,
    CustomAlert
  ],
  templateUrl: './trash-page.html',
  styleUrl: './trash-page.css',
  host: { class: 'block h-full min-h-0' }
})
// Principal Trash Page component with server-side pagination, filters, and infinite scroll
export class TrashPage implements OnInit {
  // Dependencies
  private readonly trashService = inject(TrashService);
  private readonly toastService = inject(ToastService);

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
  readonly sortByControl = new FormControl<string>('deletedAt', { nonNullable: true });
  readonly directionControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });
  readonly extensionControl = new FormControl<string>('', { nonNullable: true });
  readonly fromControl = new FormControl<string>('', { nonNullable: true });
  readonly toControl = new FormControl<string>('', { nonNullable: true });

  // Confirm dialog state
  readonly confirmModalOpen = signal<boolean>(false);
  readonly confirmModalLoading = signal<boolean>(false);
  readonly confirmAction = signal<'restore' | 'delete' | 'empty'>('restore');
  readonly targetItem = signal<DriveItem | null>(null);

  // Filter options
  readonly typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'FOLDER', label: 'Carpetas' },
    { value: 'FILE', label: 'Archivos' }
  ];

  readonly sortByOptions = [
    { value: 'deletedAt', label: 'Fecha de eliminación' },
    { value: 'name', label: 'Nombre' },
    { value: 'sizeBytes', label: 'Tamaño' }
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
      this.extensionControl.value ||
      this.fromControl.value ||
      this.toControl.value ||
      this.sortByControl.value !== 'deletedAt' ||
      this.directionControl.value !== 'desc'
    );
  });

  // Empty state condition
  readonly emptyStateType = computed<'loading' | 'trash-empty' | 'search-empty' | 'none'>(() => {
    if (!this.initialized() || (this.loading() && this.items().length === 0)) return 'loading';
    if (this.items().length === 0 && this.hasActiveFilters()) return 'search-empty';
    if (this.items().length === 0) return 'trash-empty';
    return 'none';
  });

  // Computed dialog details
  readonly dialogType = computed<ConfirmDialogType>(() =>
    this.confirmAction() === 'restore' ? 'warning' : 'danger'
  );

  readonly dialogTitle = computed(() => {
    switch (this.confirmAction()) {
      case 'delete': return 'Eliminar definitivamente';
      case 'empty': return 'Vaciar papelera';
      default: return 'Restaurar elemento';
    }
  });

  readonly dialogMessage = computed(() => {
    const item = this.targetItem();
    if (this.confirmAction() === 'empty') {
      return '¿Deseas eliminar permanentemente todos los elementos de la papelera? Esta acción no se puede revertir.';
    }
    if (!item) return '';
    if (this.confirmAction() === 'delete') {
      return `¿Deseas eliminar permanentemente '${item.name}'? Esta acción no se puede revertir.`;
    }
    return `¿Deseas restaurar '${item.name}' a su ubicación original?`;
  });

  readonly dialogConfirmLabel = computed(() => {
    switch (this.confirmAction()) {
      case 'delete': return 'Eliminar definitivamente';
      case 'empty': return 'Vaciar papelera';
      default: return 'Restaurar';
    }
  });

  // Icons
  readonly lucideTrash2Icon = lucideTrash2;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideInfoIcon = lucideInfo;
  readonly lucideCalendarIcon = lucideCalendar;

  constructor() {
    // Reactive filter triggers — debounce search only
    merge(
      this.searchControl.valueChanges.pipe(debounceTime(350)),
      this.typeFilterControl.valueChanges,
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

  // Fetch trash items with server-side pagination and filters
  fetchItems({ reset = false }: { reset?: boolean } = {}): void {
    const targetPage = reset ? 0 : this.currentPage() + 1;

    if (reset) {
      this.loading.set(true);
      this.initialized.set(false);
    } else {
      this.loadingMore.set(true);
    }

    const query: TrashQueryParams = {
      page: targetPage,
      size: this.pageSize,
      direction: this.directionControl.value,
      sortBy: this.sortByControl.value || undefined,
      search: this.searchControl.value.trim() || undefined,
      type: (this.typeFilterControl.value as 'FILE' | 'FOLDER') || undefined,
      extension: this.extensionControl.value || undefined,
      from: this.fromControl.value || undefined,
      to: this.toControl.value || undefined
    };

    this.trashService.getTrashItems(query).subscribe({
      next: (response) => {
        const mapped = (response.content || []).map(item => mapTrashItemToDriveItem(item));

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
        this.toastService.error(err.message || 'Error al cargar la papelera.', 'Error');
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
    this.extensionControl.setValue('');
    this.sortByControl.setValue('deletedAt');
    this.directionControl.setValue('desc');
    this.fromControl.setValue('');
    this.toControl.setValue('');
  }

  // Restore action trigger
  onRestoreItem(item: DriveItem): void {
    this.targetItem.set(item);
    this.confirmAction.set('restore');
    this.confirmModalOpen.set(true);
  }

  // Permanent delete action trigger
  onPermanentDeleteItem(item: DriveItem): void {
    this.targetItem.set(item);
    this.confirmAction.set('delete');
    this.confirmModalOpen.set(true);
  }

  // Empty trash trigger
  onEmptyTrash(): void {
    this.targetItem.set(null);
    this.confirmAction.set('empty');
    this.confirmModalOpen.set(true);
  }

  // Handle confirm execution
  handleConfirm(): void {
    this.confirmModalLoading.set(true);

    if (this.confirmAction() === 'empty') {
      this.trashService.emptyTrash().subscribe({
        next: () => {
          this.toastService.success('La papelera ha sido vaciada.', 'Papelera vaciada');
          this.closeConfirmDialog();
          this.fetchItems({ reset: true });
        },
        error: (err: ErrorResponse) => {
          this.toastService.error(err.message || 'Error al vaciar la papelera.', 'Error');
          this.confirmModalLoading.set(false);
        }
      });
      return;
    }

    const item = this.targetItem();
    if (!item || !item.trashBatchId) {
      this.toastService.error('No se encontró el identificador del elemento.', 'Error');
      this.closeConfirmDialog();
      return;
    }

    if (this.confirmAction() === 'restore') {
      this.trashService.restoreFromTrash(item.trashBatchId).subscribe({
        next: () => {
          this.toastService.success(`'${item.name}' ha sido restaurado con éxito.`, 'Restaurado');
          this.closeConfirmDialog();
          this.fetchItems({ reset: true });
        },
        error: (err: ErrorResponse) => {
          this.toastService.error(err.message || 'Error al restaurar el elemento.', 'Error');
          this.confirmModalLoading.set(false);
        }
      });
    } else {
      this.trashService.deletePermanently(item.trashBatchId).subscribe({
        next: () => {
          this.toastService.success(
            `'${item.name}' ha sido eliminado definitivamente.`,
            'Eliminado'
          );
          this.closeConfirmDialog();
          this.fetchItems({ reset: true });
        },
        error: (err: ErrorResponse) => {
          this.toastService.error(err.message || 'Error al eliminar definitivamente.', 'Error');
          this.confirmModalLoading.set(false);
        }
      });
    }
  }

  // Method to close the confirm dialog
  closeConfirmDialog(): void {
    this.confirmModalOpen.set(false);
    this.confirmModalLoading.set(false);
    this.targetItem.set(null);
  }
}
