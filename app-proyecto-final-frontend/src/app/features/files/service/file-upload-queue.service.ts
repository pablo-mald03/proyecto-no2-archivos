import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { Subject } from 'rxjs';
import { FileService } from './file.service';
import { ToastService } from '../../../core/services/toast.service';
import { FileResponse } from '../models/response/file-response.model';
import { ErrorResponse } from '../../errors/models/error-response.model';
import { UploadItem } from '../models/upload-item.model';


@Injectable({
  providedIn: 'root'
})
// Service to upload a queue of files
export class FileUploadQueueService {
  private readonly fileService = inject(FileService);
  private readonly toastService = inject(ToastService);

  readonly queue = signal<UploadItem[]>([]);
  readonly isOpen = signal<boolean>(false);
  readonly isMinimized = signal<boolean>(false);

  readonly fileUploaded$ = new Subject<{ file: FileResponse; folderId: string | null }>();

  readonly isUploading = computed(() =>
    this.queue().some(item => item.status === 'uploading' || item.status === 'pending')
  );

  readonly completedCount = computed(() =>
    this.queue().filter(item => item.status === 'completed').length
  );

  readonly totalCount = computed(() => this.queue().length);

  readonly errorCount = computed(() =>
    this.queue().filter(item => item.status === 'error').length
  );

  readonly overallProgress = computed(() => {
    const items = this.queue();
    if (!items.length) return 0;
    const sum = items.reduce((acc, curr) => acc + curr.progress, 0);
    return Math.round(sum / items.length);
  });

  // Method to enqueue multiple files to upload in background
  enqueueFiles(files: File[], folderId: string | null): void {
    if (!files.length) return;

    const newItems: UploadItem[] = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      folderId,
      progress: 0,
      status: 'pending'
    }));

    this.queue.update(q => [...q, ...newItems]);
    this.isOpen.set(true);
    this.isMinimized.set(false);

    this.processNext();
  }

  // Method to create a queue sequentially one by one
  private processNext(): void {
    const current = this.queue();
    const currentlyUploading = current.some(i => i.status === 'uploading');
    if (currentlyUploading) return;

    const nextItem = current.find(i => i.status === 'pending');
    if (!nextItem) return;

    this.updateItem(nextItem.id, { status: 'uploading', progress: 0 });

    this.fileService.uploadFiles([nextItem.file], nextItem.folderId).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total
            ? Math.round((100 * event.loaded) / event.total)
            : Math.min(95, Math.round(event.loaded / 1024));
          this.updateItem(nextItem.id, { progress: percent });
        } else if (event.type === HttpEventType.Response) {
          const createdList = event.body as FileResponse[];
          const created = createdList?.[0];
          this.updateItem(nextItem.id, { status: 'completed', progress: 100 });

          if (created) {
            this.fileUploaded$.next({ file: created, folderId: nextItem.folderId });
          }

          this.processNext();
        }
      },
      error: (err: ErrorResponse) => {
        const errorMsg = err.message || 'Error al subir el archivo.';
        this.updateItem(nextItem.id, { status: 'error', error: errorMsg });
        this.toastService.error(`Fallo al subir '${nextItem.fileName}': ${errorMsg}`, 'Error de subida');
        this.processNext();
      }
    });
  }

  private updateItem(id: string, patch: Partial<UploadItem>): void {
    this.queue.update(items =>
      items.map(item => item.id === id ? { ...item, ...patch } : item)
    );
  }

  toggleMinimize(): void {
    this.isMinimized.update(val => !val);
  }

  closeWidget(): void {
    if (this.isUploading()) {
      this.isMinimized.set(true);
      this.toastService.info('Las subidas continúan en segundo plano.', 'Subida en curso');
      return;
    }
    this.isOpen.set(false);
    this.queue.set([]);
  }

  clearFinished(): void {
    this.queue.update(items => items.filter(i => i.status !== 'completed'));
    if (this.queue().length === 0) {
      this.isOpen.set(false);
    }
  }
}
