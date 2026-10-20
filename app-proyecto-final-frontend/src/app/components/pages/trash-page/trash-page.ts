import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import {
  lucideChevronDown, lucideInfo, lucideRotateCcw, lucideSearch, lucideSlidersHorizontal, lucideTrash2
} from '@ng-icons/lucide';

import { TrashService } from '../../../features/trash/service/trash.service';
import { ToastService } from '../../../core/services/toast.service';
import { TrashItem } from '../../../features/trash/models/trash-item.model';
import { DriveItem, mapTrashItemToDriveItem } from '../../../features/drive/drive-item.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ConfirmDialogType } from '../../common/custom-confirm-dialog/types/confirm-dialog.types';

import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomConfirmDialog } from '../../common/custom-confirm-dialog/custom-confirm-dialog';
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
    DriveItemListComponent,
    EmptyStateComponent,
    CustomAlert
  ],
  templateUrl: './trash-page.html',
  styleUrl: './trash-page.css',
  host: { class: 'flex flex-col h-full min-h-0 overflow-y-auto pr-2' }
})
// Principal Trash Page component to view, filter, restore and permanently delete items
export class TrashPage implements OnInit {
  // Dependencies
  private readonly trashService = inject(TrashService);
  private readonly toastService = inject(ToastService);

  // Data signals
  readonly trashItems = signal<TrashItem[]>([]);
  readonly loading = signal<boolean>(false);

  // Filters state
  readonly filtersExpanded = signal<boolean>(false);

  // Confirm dialog state
  readonly confirmModalOpen = signal<boolean>(false);
  readonly confirmModalLoading = signal<boolean>(false);
  readonly confirmAction = signal<'restore' | 'delete'>('restore');
  readonly targetItem = signal<DriveItem | null>(null);


  // Filters state using FormControls to fit CustomDropdown
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly typeFilterControl = new FormControl<string>('ALL', { nonNullable: true });
  readonly sortOptionControl = new FormControl<string>('deletedAt_desc', { nonNullable: true });

  // Filter options
  readonly typeOptions = [
    { value: 'ALL', label: 'Todos los tipos' },
    { value: 'FOLDER', label: 'Carpetas' },
    { value: 'FILE', label: 'Archivos' }
  ];

  readonly sortOptions = [
    { value: 'deletedAt_desc', label: 'Eliminado (más reciente)' },
    { value: 'deletedAt_asc', label: 'Eliminado (más antiguo)' },
    { value: 'name_asc', label: 'Nombre (A - Z)' },
    { value: 'name_desc', label: 'Nombre (Z - A)' },
    { value: 'size_desc', label: 'Tamaño (mayor a menor)' },
    { value: 'size_asc', label: 'Tamaño (menor a mayor)' }
  ];

  // Icons
  readonly lucideTrash2Icon = lucideTrash2;
  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideInfoIcon = lucideInfo;

  ngOnInit(): void {
    this.loadTrashItems();
  }

  // Load items from trash service
  loadTrashItems(): void {
    this.loading.set(true);
    this.trashService.getTrashItems().subscribe({
      next: (items) => {
        this.trashItems.set(items || []);
        this.loading.set(false);
      },
      error: (err: ErrorResponse) => {
        this.trashItems.set([]);
        this.loading.set(false);
        this.toastService.error(
          err.message || 'Error al cargar los elementos de la papelera.',
          'Error'
        );
      }
    });
  }

  // Filtered and sorted items representation
  readonly displayedItems = computed<DriveItem[]>(() => {
    let list = this.trashItems().map(item => mapTrashItemToDriveItem(item));

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

    const sort = this.sortOptionControl.value;
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'deletedAt_desc': {
          const tA = new Date(a.deletedAt || a.updatedAt).getTime();
          const tB = new Date(b.deletedAt || b.updatedAt).getTime();
          return tB - tA;
        }
        case 'deletedAt_asc': {
          const tA = new Date(a.deletedAt || a.updatedAt).getTime();
          const tB = new Date(b.deletedAt || b.updatedAt).getTime();
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

  // Empty state condition
  readonly emptyStateType = computed<'loading' | 'trash-empty' | 'search-empty' | 'none'>(() => {
    if (this.loading()) return 'loading';
    if (this.trashItems().length === 0) return 'trash-empty';
    if (this.displayedItems().length === 0) return 'search-empty';
    return 'none';
  });

  // Computed dialog details
  readonly dialogType = computed<ConfirmDialogType>(() =>
    this.confirmAction() === 'delete' ? 'danger' : 'warning'
  );

  readonly dialogTitle = computed(() =>
    this.confirmAction() === 'delete' ? 'Eliminar definitivamente' : 'Restaurar elemento'
  );

  readonly dialogMessage = computed(() => {
    const item = this.targetItem();
    if (!item) return '';
    if (this.confirmAction() === 'delete') {
      return `¿Deseas eliminar permanentemente '${item.name}'? Esta acción no se puede revertir.`;
    }
    return `¿Deseas restaurar '${item.name}' a su ubicación original?`;
  });

  readonly dialogConfirmLabel = computed(() =>
    this.confirmAction() === 'delete' ? 'Eliminar definitivamente' : 'Restaurar'
  );

  // Filters actions
  resetFilters(): void {
    this.searchControl.setValue('');
    this.typeFilterControl.setValue('ALL');
    this.sortOptionControl.setValue('deletedAt_desc');
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

  // Handle confirm execution
  handleConfirm(): void {
    const item = this.targetItem();
    if (!item || !item.trashBatchId) {
      this.toastService.error('No se encontró el identificador del elemento.', 'Error');
      this.closeConfirmDialog();
      return;
    }

    this.confirmModalLoading.set(true);

    if (this.confirmAction() === 'restore') {
      this.trashService.restoreFromTrash(item.trashBatchId).subscribe({
        next: () => {
          this.toastService.success(`'${item.name}' ha sido restaurado con éxito.`, 'Restaurado');
          this.closeConfirmDialog();
          this.loadTrashItems();
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
          this.loadTrashItems();
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
