import { Component, inject, input, output, signal } from '@angular/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { NgIconComponent } from '@ng-icons/core';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { ToastService } from '../../../core/services/toast.service';
import { lucideCloudUpload, lucideFileText, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-upload-file-modal-component',
  imports: [CustomButton, NgIconComponent, CustomModalComponent],
  templateUrl: './upload-file-modal-component.html',
  styleUrl: './upload-file-modal-component.css',
})
//Principal component to upload the file modal
export class UploadFileModalComponent {
  private readonly toastService = inject(ToastService);

  // Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly closed = output<void>();
  readonly fileUploaded = output<File>();

  // State
  readonly isDragging = signal(false);
  readonly selectedFile = signal<File | null>(null);

  // Icons
  readonly lucideCloudUploadIcon = lucideCloudUpload;
  readonly lucideFileTextIcon = lucideFileText;
  readonly lucideXIcon = lucideX;

  //Drag over event method
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  //Drag leave event method
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  //Drop dynamic section
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  //Method to check the file selected
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
      input.value = '';
    }
  }

  //Method to validate the file
  validateAndSetFile(file: File): void {
    const fileName = file.name.toLowerCase();
    const isValid = fileName.endsWith('.txt') || fileName.endsWith('.md');

    if (!isValid) {
      this.toastService.error('Solo se permiten archivos con extensión .txt o .md', 'Formato no válido');
      return;
    }

    this.selectedFile.set(file);
  }

  //Method to formate the file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  //Method to confirm the upload Manual submit
  confirmUpload(): void {
    const file = this.selectedFile();
    if (file) {
      this.fileUploaded.emit(file);
      this.close();
    }
  }

  //Method to close the modal
  close(): void {
    this.selectedFile.set(null);
    this.isDragging.set(false);
    this.closed.emit();
  }
}