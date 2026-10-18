import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { CustomInfiniteScroll } from '../../common/custom-infinite-scroll/custom-infinite-scroll';
import { DriveItemRow } from '../../common/drive-item-row/drive-item-row';
import { ToastService } from '../../../core/services/toast.service';
import { DriveItem } from '../../../features/drive/drive-item.model';
import { lucideChevronDown, lucidePlus, lucideSearch, lucideSlidersHorizontal } from '@ng-icons/lucide';

@Component({
  selector: 'app-drive-files-page-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    CustomButton,
    CustomCard,
    CustomTextfield,
    CustomAlert,
    CustomInfiniteScroll,
    DriveItemRow
  ],
  templateUrl: './drive-files-page-component.html',
  styleUrl: './drive-files-page-component.css',
})
export class DriveFilesPageComponent implements OnInit {

  // Services
  private readonly toastService = inject(ToastService);

  // Filters State
  readonly filtersExpanded = signal(false);
  readonly searchControl = new FormControl('', { nonNullable: true });

  // Infinite Scroll & Data State
  readonly items = signal<DriveItem[]>([]);
  readonly loading = signal(false);
  readonly initialized = signal(false);
  readonly hasMore = signal(true);

  // Icons
  readonly lucideSlidersHorizontalIcon = lucideSlidersHorizontal;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideSearchIcon = lucideSearch;
  readonly lucidePlusIcon = lucidePlus;

  ngOnInit(): void {
    this.loadMockFiles();
  }

  // Carga inicial simulada (Mock)
  loadMockFiles(): void {
    this.loading.set(true);
    
    setTimeout(() => {
      const mockData: DriveItem[] = [
        { id: '1', name: 'Documentación del Proyecto', type: 'folder', updatedAt: new Date() },
        { id: '2', name: 'Notas de Arquitectura.md', type: 'file', extension: 'md', sizeBytes: 15400, updatedAt: new Date(), shared: true },
        { id: '3', name: 'Credenciales_Servidor.txt', type: 'file', extension: 'txt', sizeBytes: 1024, updatedAt: new Date() },
        { id: '4', name: 'Guía de Despliegue.md', type: 'file', extension: 'md', sizeBytes: 45200, updatedAt: new Date() },
        { id: '5', name: 'Apuntes Personales.txt', type: 'file', extension: 'txt', sizeBytes: 512, updatedAt: new Date() }
      ];

      this.items.set(mockData);
      this.loading.set(false);
      this.initialized.set(true);
      this.hasMore.set(false); // Simulamos que no hay más páginas por ahora
    }, 600);
  }

  loadMore(): void {
    // Lógica para la paginación con infinite scroll cuando conectes el backend
  }

  // Acciones de las filas
  onShare(item: DriveItem): void {
    this.toastService.success(`Enlace de '${item.name}' copiado al portapapeles.`, 'Compartir');
  }

  onPreview(item: DriveItem): void {
    this.toastService.success(`Abriendo vista previa de ${item.name}`, 'Vista Previa');
  }

  onDownload(item: DriveItem): void {
    this.toastService.success(`Descargando ${item.name}...`, 'Descarga');
  }

  onDelete(item: DriveItem): void {
    this.items.update(list => list.filter(i => i.id !== item.id));
    this.toastService.success(`Se eliminó '${item.name}' correctamente.`, 'Eliminado');
  }

  onOpenItem(item: DriveItem): void {
    if (item.type === 'folder') {
      this.toastService.success(`Navegando a la carpeta: ${item.name}`, 'Carpeta');
    } else {
      this.onPreview(item);
    }
  }

  uploadFile(): void {
    this.toastService.success('Simulando modal de subida de archivos (.txt / .md)', 'Subir Archivo');
  }
}