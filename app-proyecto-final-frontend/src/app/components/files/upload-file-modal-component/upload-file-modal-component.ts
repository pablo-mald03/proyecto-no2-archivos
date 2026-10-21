import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { NgIconComponent } from '@ng-icons/core';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { ToastService } from '../../../core/services/toast.service';
import { lucideCloudUpload, lucideFileText, lucideTrash2, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-upload-file-modal-component',
  standalone: true,
  imports: [CustomButton, NgIconComponent, CustomModalComponent],
  templateUrl: './upload-file-modal-component.html',
  styleUrl: './upload-file-modal-component.css',
})
// Component allowing multi-file selection for background queue upload
export class UploadFileModalComponent {
  private readonly toastService = inject(ToastService);

  // Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly closed = output<void>();
  readonly filesUploaded = output<File[]>();

  // State
  readonly isDragging = signal(false);
  readonly selectedFiles = signal<File[]>([]);

  readonly totalFilesCount = computed(() => this.selectedFiles().length);
  readonly totalSize = computed(() =>
    this.selectedFiles().reduce((acc, file) => acc + file.size, 0)
  );

  // Icons
  readonly lucideCloudUploadIcon = lucideCloudUpload;
  readonly lucideFileTextIcon = lucideFileText;
  readonly lucideXIcon = lucideX;
  readonly lucideTrashIcon = lucideTrash2;

  // Drag over event method
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  // Drag leave event method
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  // Drop dynamic section
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleIncomingFiles(Array.from(files));
    }
  }

  // Method to check files selected via input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleIncomingFiles(Array.from(input.files));
      input.value = '';
    }
  }

  // Validate incoming files and enforce 20 file max limit
  private handleIncomingFiles(files: File[]): void {
    const currentFiles = this.selectedFiles();
    const validFiles: File[] = [];
    let hasInvalid = false;

    for (const file of files) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.txt') || lower.endsWith('.md')) {
        validFiles.push(file);
      } else {
        hasInvalid = true;
      }
    }

    if (hasInvalid) {
      this.toastService.warning('Solo se permiten archivos con extensión .txt o .md', 'Formato no admitido');
    }

    if (!validFiles.length) return;

    const availableSlots = 20 - currentFiles.length;
    if (availableSlots <= 0) {
      this.toastService.error('Se ha alcanzado el límite máximo de 20 archivos por subida.', 'Límite alcanzado');
      return;
    }

    let filesToAdd = validFiles;
    if (validFiles.length > availableSlots) {
      this.toastService.warning(
        `Se agregaron solo ${availableSlots} archivos. El límite máximo es de 20.`,
        'Límite de 20 archivos'
      );
      filesToAdd = validFiles.slice(0, availableSlots);
    }

    this.selectedFiles.update(list => [...list, ...filesToAdd]);
  }

  // Remove a single staged file
  removeFile(index: number): void {
    this.selectedFiles.update(list => list.filter((_, i) => i !== index));
  }

  // Clear all staged files
  clearAll(): void {
    this.selectedFiles.set([]);
  }

  // Method to format the file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Method to confirm upload
  confirmUpload(): void {
    const files = this.selectedFiles();
    if (files.length > 0) {
      this.filesUploaded.emit(files);
      this.close();
    }
  }

  // Method to close the modal
  close(): void {
    this.selectedFiles.set([]);
    this.isDragging.set(false);
    this.closed.emit();
  }
}