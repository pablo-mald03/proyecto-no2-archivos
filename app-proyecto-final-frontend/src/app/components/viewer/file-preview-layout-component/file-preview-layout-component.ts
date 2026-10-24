import { Component, computed, effect, HostListener, inject, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { FilePreviewHeaderComponent } from '../file-preview-header-component/file-preview-header-component';
import { FilePreviewContentComponent } from '../file-preview-content-component/file-preview-content-component';
import { FileCommentsPanelComponent } from '../file-comments-panel-component/file-comments-panel-component';
import { ShareModalComponent } from '../../sharing/share-modal-component/share-modal-component';

import { FileService } from '../../../features/files/service/file.service';
import { CommentService } from '../../../features/comments/service/comment.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../stores/auth.state';

import { FileResponse } from '../../../features/files/models/response/file-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { CommentResponse } from '../../../features/comments/models/response/comment-response.model';
import { PermissionRole, ShareAccessLevel } from '../../../features/shares/constants/share.constants';
import { FileActivityPanelComponent } from '../../activity/file-activity-panel-component/file-activity-panel-component';
import { resolveFlags, toShareAccessLevel } from '../../../core/utils/file-permissions.util';
import { StorageState } from '../../../stores/storage.state';

@Component({
  selector: 'app-file-preview-layout-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FilePreviewHeaderComponent,
    FilePreviewContentComponent,
    FileCommentsPanelComponent,
    ShareModalComponent,
    FileActivityPanelComponent
  ],
  templateUrl: './file-preview-layout-component.html',
  styleUrl: './file-preview-layout-component.css',
})
// Principal file preview layout orchestrator component
export class FilePreviewLayoutComponent implements OnInit {

  // Dependencies
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly fileService = inject(FileService);
  private readonly commentService = inject(CommentService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);
  private readonly storage = inject(StorageState);

  // Inputs & Outputs for backwards-compatible modal usage
  readonly isOpen = input<boolean>(true);
  readonly fileName = input<string>('');
  readonly fileContent = input<string>('');
  readonly comments = input<FileComment[]>([]);
  readonly canEdit = input<boolean>(true);

  readonly closed = output<void>();
  readonly downloadClicked = output<void>();
  readonly openNewTabClicked = output<void>();
  readonly commentAdded = output<string>();
  readonly commentDeleted = output<string>();
  readonly contentSaved = output<string>();

  // Routed / Self-fetching state
  readonly isRouted = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly activeFileId = signal<string | null>(null);
  readonly activeFileName = signal<string>('Documento');
   readonly activeComments = signal<FileComment[]>([]);
  readonly activeFileMetadata = signal<FileResponse | null>(null);
  readonly submittingComment = signal(false);

  // Layout Controls State
  readonly zoomLevel = signal<number>(100);
  readonly isEditMode = signal<boolean>(false);
  readonly isCommentsOpen = signal<boolean>(false);
  readonly isActivityOpen = signal<boolean>(false);
  readonly isShareModalOpen = signal<boolean>(false);

  // Editable local content signal synced with control
  readonly editableContent = signal<string>('');
  readonly contentControl = new FormControl('', { nonNullable: true });

  readonly isOwner = computed(() => this.role() === 'OWNER');
  readonly activeCanEdit = computed(() => this.flags().canEdit);
  readonly activeCanComment = computed(() => this.flags().canComment);
  readonly activeAccessLevel = computed<ShareAccessLevel>(() => toShareAccessLevel(this.role()));


  readonly role = signal<PermissionRole>('VIEWER');
  readonly flags = computed(() => resolveFlags(this.role()));


  readonly displayAccessLevel = computed<ShareAccessLevel>(() => this.activeAccessLevel());
  readonly canShare = computed(() => this.flags().canShare);



  @ViewChild('canvas') canvasComponent?: FilePreviewContentComponent;

  constructor() {
    effect(() => {
      if (!this.isRouted()) {
        const content = this.fileContent();
        this.contentControl.setValue(content);
        this.editableContent.set(content);
      }
    });

    this.contentControl.valueChanges.subscribe(val => {
      this.editableContent.set(val);
    });
  }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.isRouted.set(true);
      this.activeFileId.set(routeId);
      this.loadFileData(routeId);
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== this.activeFileId()) {
        this.isRouted.set(true);
        this.activeFileId.set(id);
        this.loadFileData(id);
      }
    });
  }

  // Method to fetch file metadata, raw text content, and threaded comments when routed
  loadFileData(fileId: string): void {
    this.loading.set(true);

    this.fileService.getFileById(fileId).subscribe({
      next: (meta) => {
        this.activeFileMetadata.set(meta);
        this.activeFileName.set(meta.name);

        this.role.set(meta.permissions?.role ?? 'VIEWER');

        this.reloadComments(fileId);
      },
      error: (err: ErrorResponse) => {
        this.loading.set(false);
        this.toastService.error(
          err.message || 'No tienes permisos para acceder a este archivo.',
          'Acceso denegado'
        );
        this.router.navigate(['/forbidden']);
      }
    });

    this.fileService.getFileContent(fileId, true).subscribe({
      next: (content) => {
        this.editableContent.set(content);
        this.contentControl.setValue(content);
        this.loading.set(false);
      },
      error: (err: ErrorResponse) => {
        this.editableContent.set('');
        this.contentControl.setValue('');
        this.loading.set(false);
        if (err.code === 'FORBIDDEN' || err.code === 'UNAUTHORIZED' || (err as any).status === 403) {
          this.toastService.error('No tienes permisos para ver el contenido de este archivo.', 'Acceso denegado');
          this.router.navigate(['/forbidden']);
          return;
        }
        this.toastService.error(err.message || 'Error al cargar el contenido del archivo.', 'Error');
      }
    });
  }



  // Reload threaded comments for the active file
  reloadComments(fileId: string): void {
    this.commentService.getCommentsByFile(fileId).subscribe({
      next: (comments) => {
        const currentUserId = this.authState.user()?.id;
        const canModerate = this.flags().canEdit; // OWNER o EDITOR
        this.activeComments.set(
          comments.map(c => this.mapCommentResponse(c, currentUserId, canModerate))
        );
      },
      error: () => this.activeComments.set([])
    });
  }


  // Recursive comment mapper supporting threaded replies and permissions
  private mapCommentResponse(
    c: CommentResponse,
    currentUserId: string | null | undefined,
    isEditorOrOwner: boolean
  ): FileComment {
    const isAuthor = !!(currentUserId && c.authorId === currentUserId);
    const canEdit = isAuthor;
    const canDelete = isAuthor || isEditorOrOwner;

    return {
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorUsername || c.authorEmail || 'Usuario',
      createdAt: new Date(c.createdAt),
      editedAt: c.editedAt ? new Date(c.editedAt) : null,
      content: c.content,
      parentId: c.parentId,
      canEdit,
      canDelete,
      isOwner: isAuthor,
      replies: (c.replies || []).map(r => this.mapCommentResponse(r, currentUserId, isEditorOrOwner))
    };
  }

  // Computed properties
  readonly currentUserId = computed(() => this.authState.user()?.id ?? null);

  readonly displayFileName = computed(() => {
    return this.isRouted() ? this.activeFileName() : (this.fileName() || 'Documento_Sin_Titulo.txt');
  });

  readonly displayComments = computed(() => {
    return this.isRouted() ? this.activeComments() : this.comments();
  });

  readonly displayCanEdit = computed(() => {
    return this.isRouted() ? this.activeCanEdit() : this.canEdit();
  });

  readonly displayCanComment = computed(() => {
    return this.isRouted() ? this.activeCanComment() : true;
  });


  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    if (this.isOpen()) {
      this.closeLayout();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    const container = this.canvasComponent?.documentContainer?.nativeElement;
    if (container && !container.contains(event.target as Node)) {
      this.closeLayout();
    }
  }

  zoomIn(): void {
    if (this.zoomLevel() < 200) {
      this.zoomLevel.update(z => z + 15);
    }
  }

  zoomOut(): void {
    if (this.zoomLevel() > 50) {
      this.zoomLevel.update(z => z - 15);
    }
  }

  resetZoom(): void {
    this.zoomLevel.set(100);
  }

  // Toggle Activity Panel
  toggleActivity(): void {
    this.isActivityOpen.update(open => {
      const next = !open;
      if (next) this.isCommentsOpen.set(false);
      return next;
    });
  }

  toggleEditMode(): void {
    if (!this.displayCanEdit()) return;
    this.isEditMode.update(mode => !mode);
  }

  // Update toggleComments to close activity when opening comments
  toggleComments(): void {
    this.isCommentsOpen.update(open => {
      const next = !open;
      if (next) this.isActivityOpen.set(false);
      return next;
    });
  }

  // Handle adding a top-level comment or threaded reply
  handleCommentAdded(event: { content: string; parentId?: string | null }): void {
    if (!this.displayCanComment()) {
      this.toastService.warning('Tu nivel de acceso es solo lectura. No puedes comentar.', 'Permiso denegado');
      return;
    }

    const fileId = this.activeFileId();
    if (!fileId) {
      this.commentAdded.emit(event.content);
      return;
    }

    if (this.submittingComment()) return;
    this.submittingComment.set(true);

    this.commentService.createComment(fileId, {
      content: event.content,
      parentId: event.parentId || null
    }).subscribe({
      next: () => {
        this.toastService.success(
          event.parentId ? 'Respuesta añadida con éxito.' : 'Comentario añadido con éxito.',
          'Comentarios'
        );
        this.reloadComments(fileId);
        this.commentAdded.emit(event.content);
        this.submittingComment.set(false);
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(err.message || 'Error al añadir el comentario.', 'Error');
        this.submittingComment.set(false);
      }
    });
  }

  // Handle editing a comment
  handleCommentUpdated(event: { id: string; content: string }): void {
    const fileId = this.activeFileId();
    if (!fileId) return;

    this.commentService.updateComment(event.id, { content: event.content }).subscribe({
      next: () => {
        this.toastService.success('Comentario actualizado con éxito.', 'Comentarios');
        this.reloadComments(fileId);
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(err.message || 'Error al actualizar el comentario.', 'Error');
      }
    });
  }

  // Handle deleting a comment
  handleCommentDeleted(commentId: string): void {
    const fileId = this.activeFileId();
    if (!fileId) {
      this.commentDeleted.emit(commentId);
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.toastService.success('Comentario eliminado.', 'Comentarios');
        this.reloadComments(fileId);
        this.commentDeleted.emit(commentId);
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(err.message || 'Error al eliminar el comentario.', 'Error');
      }
    });
  }

  // Handle saving the updated text content to backend
  saveChanges(): void {
    if (!this.displayCanEdit()) {
      this.toastService.warning('No tienes permisos de edición en este archivo.', 'Permiso denegado');
      return;
    }

    const fileId = this.activeFileId();
    const newContent = this.editableContent();

    if (!fileId) {
      this.contentSaved.emit(newContent);
      this.isEditMode.set(false);
      return;
    }

    this.saving.set(true);
    this.fileService.updateContent(fileId, { content: newContent }).subscribe({
      next: () => {
        this.saving.set(false);
        this.isEditMode.set(false);
        this.toastService.success('Archivo guardado correctamente.', 'Guardado');
        this.storage.refresh();  
        this.contentSaved.emit(newContent);
      },
      error: (err: ErrorResponse) => {
        this.saving.set(false);
        this.toastService.error(err.message || 'Error al guardar el contenido.', 'Error');
      }
    });
  }

  // Method to handle real file download
  downloadFile(): void {
    const fileId = this.activeFileId();
    if (fileId) {
      this.fileService.downloadFile(fileId).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.displayFileName();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.toastService.success(`Descargando ${this.displayFileName()}...`, 'Descarga');
          this.downloadClicked.emit();
        },
        error: (err: ErrorResponse) => {
          this.toastService.error(err.message || 'Error al descargar el archivo.', 'Error');
        }
      });
      return;
    }

    // Fallback if not routed
    const content = this.editableContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.displayFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    this.downloadClicked.emit();
  }

  // Method to open file content in a new browser tab
  openInNewTab(): void {
    const content = this.editableContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    this.openNewTabClicked.emit();
  }

  // Close preview layout and navigate back when routed
  closeLayout(): void {
    this.isEditMode.set(false);
    this.closed.emit();

    if (this.isRouted()) {
      if (window.history.length > 1) {
        this.location.back();
      } else {
        const folderId = this.isOwner() ? this.activeFileMetadata()?.folderId : null;
        if (folderId) {
          this.router.navigate(['/drive/files/folder', folderId]);
        } else {
          this.router.navigate(['/drive/files']);
        }
      }
    }
  }

  // Share modal handlers
  openShareModal(): void {
    this.isShareModalOpen.set(true);
  }

  closeShareModal(): void {
    this.isShareModalOpen.set(false);
  }
}