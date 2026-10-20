import { Component, computed, effect, ElementRef, HostListener, inject, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { lucideCode, lucideDownload, lucideExternalLink, lucideEye, lucideFileText, lucideMessageSquare, lucidePencil, lucidePrinter, lucideRotateCcw, lucideSave, lucideX, lucideZoomIn, lucideZoomOut } from '@ng-icons/lucide';
import { FileCommentsPanelComponent } from '../file-comments-panel-component/file-comments-panel-component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomTextarea } from '../../common/custom-text-area/custom-text-area';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FileService } from '../../../features/files/service/file.service';
import { CommentService } from '../../../features/comments/service/comment.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../stores/auth.state';
import { FileResponse } from '../../../features/files/models/response/file-response.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { ShareService } from '../../../features/shares/service/share.service';
import { ShareAccessLevel } from '../../../features/shares/constants/share.constants';
import { ShareResponse } from '../../../features/shares/models/response/share-response.model';
import { AuthUser } from '../../../features/auth/models/aut-user.model';

@Component({
  selector: 'app-file-preview-layout-component',
  standalone: true,
  imports: [
    NgIcon,
    CustomButton,
    FileCommentsPanelComponent,
    CustomTextarea,
    ReactiveFormsModule
  ],
  templateUrl: './file-preview-layout-component.html',
  styleUrl: './file-preview-layout-component.css',
})
// Principal file preview layout component, supports both routed mode and modal mode
export class FilePreviewLayoutComponent implements OnInit {

  // Dependencies
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly fileService = inject(FileService);
  private readonly commentService = inject(CommentService);
  private readonly shareService = inject(ShareService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);

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
  readonly activeCanEdit = signal<boolean>(false);
  readonly activeCanComment = signal<boolean>(false);
  readonly activeAccessLevel = signal<ShareAccessLevel>('VIEWER');
  readonly isOwner = signal<boolean>(false);
  readonly activeFileMetadata = signal<FileResponse | null>(null);
  readonly submittingComment = signal(false);

  // Layout Controls State
  readonly zoomLevel = signal<number>(100);
  readonly isEditMode = signal<boolean>(false);
  readonly isCommentsOpen = signal<boolean>(false);
  readonly markdownViewMode = signal<'preview' | 'raw'>('preview');

  // Editable local content signal synced with control
  readonly editableContent = signal<string>('');
  readonly contentControl = new FormControl('', { nonNullable: true });

  @ViewChild('documentContainer') documentContainer?: ElementRef<HTMLDivElement>;

  // Icons
  readonly lucideXIcon = lucideX;
  readonly lucideZoomInIcon = lucideZoomIn;
  readonly lucideZoomOutIcon = lucideZoomOut;
  readonly lucideDownloadIcon = lucideDownload;
  readonly lucideExternalLinkIcon = lucideExternalLink;
  readonly lucideMessageSquareIcon = lucideMessageSquare;
  readonly lucideEditIcon = lucidePencil;
  readonly lucideEyeIcon = lucideEye;
  readonly lucideCodeIcon = lucideCode;
  readonly lucideSaveIcon = lucideSave;

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

        const currentUser = this.authState.user();
        const currentUserId = currentUser?.id;
        const isOwner = !!(currentUserId && meta.ownerId === currentUserId);
        this.isOwner.set(isOwner);

        if (isOwner) {
          this.applyAccessLevel('EDITOR');
        } else {
          this.determineSharedAccessLevel(fileId, currentUser);
        }
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

    this.fileService.getFileContent(fileId).subscribe({
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

    this.reloadComments(fileId);
  }

  // Method to determine the access level from shares or shared-with-me list
  private determineSharedAccessLevel(fileId: string, currentUser: AuthUser | null): void {
    this.shareService.getResourceShares('files', fileId).subscribe({
      next: (shares) => {
        const matchingShare = this.findMatchingShare(shares, currentUser);
        if (matchingShare) {
          this.applyAccessLevel(matchingShare.access);
        } else {
          this.checkSharedWithMe(fileId);
        }
      },
      error: () => {
        this.checkSharedWithMe(fileId);
      }
    });
  }

  // Fallback method to checking shared-with-me items
  private checkSharedWithMe(fileId: string): void {
    this.shareService.getSharedWithMe().subscribe({
      next: (items) => {
        const match = items.find(
          item => item.resource?.id === fileId || item.share?.resourceId === fileId
        );
        if (match?.share?.access) {
          this.applyAccessLevel(match.share.access);
        } else {
          this.applyAccessLevel('VIEWER');
        }
      },
      error: () => {
        this.applyAccessLevel('VIEWER');
      }
    });
  }

  // Method to find direct user share or ANY_USER share
  private findMatchingShare(shares: ShareResponse[], currentUser: AuthUser | null): ShareResponse | null {
    if (!shares || !shares.length) return null;

    const userShare = shares.find(s =>
      s.granteeType === 'USER' && (
        (s.granteeId && s.granteeId === currentUser?.id) ||
        (s.granteeEmail && currentUser?.email && s.granteeEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (s.granteeUsername && currentUser?.username && s.granteeUsername.toLowerCase() === currentUser.username.toLowerCase())
      )
    );
    if (userShare) return userShare;

    const anyUserShare = shares.find(s => s.granteeType === 'ANY_USER');
    return anyUserShare || null;
  }

  // Apply access level permissions
  private applyAccessLevel(level: ShareAccessLevel): void {
    this.activeAccessLevel.set(level);
    if (level === 'EDITOR') {
      this.activeCanEdit.set(true);
      this.activeCanComment.set(true);
    } else if (level === 'COMMENTER') {
      this.activeCanEdit.set(false);
      this.activeCanComment.set(true);
    } else { // 'VIEWER'
      this.activeCanEdit.set(false);
      this.activeCanComment.set(false);
    }

    const fileId = this.activeFileId();
    if (fileId) {
      this.reloadComments(fileId);
    }
  }

  // Reload threaded comments for the active file
  reloadComments(fileId: string): void {
    this.commentService.getCommentsByFile(fileId).subscribe({
      next: (comments) => {
        const currentUserId = this.authState.user()?.id;
        const isEditorOrOwner = this.isOwner() || this.displayAccessLevel() === 'EDITOR';

        const mapped: FileComment[] = comments.map(c => {
          const isAuthor = currentUserId ? c.authorId === currentUserId : false;
          return {
            id: c.id,
            authorName: c.authorUsername || c.authorEmail || 'Usuario',
            createdAt: new Date(c.createdAt),
            content: c.content,
            isOwner: isEditorOrOwner || isAuthor
          };
        });
        this.activeComments.set(mapped);
      },
      error: () => {
        this.activeComments.set([]);
      }
    });
  }

  // Computed properties resolving between routed and input mode
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

  readonly displayAccessLevel = computed<ShareAccessLevel>(() => {
    return this.isOwner() ? 'EDITOR' : this.activeAccessLevel();
  });

  readonly canDeleteComments = computed(() => {
    return this.isOwner() || this.displayAccessLevel() === 'EDITOR';
  });

  // Computed to parse Markdown into safe HTML using marked
  readonly renderedMarkdown = computed<SafeHtml>(() => {
    const rawContent = this.editableContent();
    const parsedHtml = marked.parse(rawContent) as string;
    return this.sanitizer.bypassSecurityTrustHtml(parsedHtml);
  });

  readonly isMarkdown = computed(() => {
    return this.displayFileName().toLowerCase().endsWith('.md');
  });

  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    if (this.isOpen()) {
      this.closeLayout();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.documentContainer && !this.documentContainer.nativeElement.contains(event.target as Node)) {
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

  toggleEditMode(): void {
    if (!this.displayCanEdit()) return;
    this.isEditMode.update(mode => !mode);
  }

  toggleComments(): void {
    this.isCommentsOpen.update(open => !open);
  }

  setMarkdownView(mode: 'preview' | 'raw'): void {
    this.markdownViewMode.set(mode);
  }

  // Handle adding a comment to the file
  handleCommentAdded(content: string): void {
    if (!this.displayCanComment()) {
      this.toastService.warning('Tu nivel de acceso es solo lectura. No puedes comentar.', 'Permiso denegado');
      return;
    }

    const fileId = this.activeFileId();

    if (!fileId) {
      this.commentAdded.emit(content);
      return;
    }

    if (this.submittingComment()) return;

    this.submittingComment.set(true);

    this.commentService.createComment(fileId, { content }).subscribe({
      next: (created) => {
        const newComment: FileComment = {
          id: created.id,
          authorName:
            created.authorUsername ||
            created.authorEmail ||
            this.authState.user()?.username ||
            'Usuario',
          createdAt: new Date(created.createdAt || Date.now()),
          content: created.content,
          isOwner: true
        };

        this.activeComments.update(list => [...list, newComment]);

        this.toastService.success(
          'Comentario añadido con éxito.',
          'Comentarios'
        );

        this.commentAdded.emit(content);
        this.submittingComment.set(false);
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(
          err.message || 'Error al añadir el comentario.',
          'Error'
        );

        this.submittingComment.set(false);
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
        this.activeComments.update(list => list.filter(c => c.id !== commentId));
        this.toastService.success('Comentario eliminado.', 'Comentarios');
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
}