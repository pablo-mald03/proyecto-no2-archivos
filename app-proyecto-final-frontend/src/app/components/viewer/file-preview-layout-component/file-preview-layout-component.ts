import { Component, computed, effect, ElementRef, HostListener, input, output, signal, ViewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { lucideCode, lucideDownload, lucideExternalLink, lucideEye, lucideFileText, lucideMessageSquare, lucidePencil, lucidePrinter, lucideRotateCcw, lucideSave, lucideX, lucideZoomIn, lucideZoomOut } from '@ng-icons/lucide';
import { FileCommentsPanelComponent } from '../file-comments-panel-component/file-comments-panel-component';

@Component({
  selector: 'app-file-preview-layout-component',
  standalone: true,
  imports: [
    NgIcon,
    CustomButton,
    FileCommentsPanelComponent
  ],
  templateUrl: './file-preview-layout-component.html',
  styleUrl: './file-preview-layout-component.css',
})
//Principal file preview layout component
export class FilePreviewLayoutComponent {
  // Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly fileName = input<string>('Documento_Sin_Titulo.txt');
  readonly fileContent = input<string>('');
  readonly comments = input<FileComment[]>([]);
  readonly canEdit = input<boolean>(true);

  readonly closed = output<void>();
  readonly downloadClicked = output<void>();
  readonly printClicked = output<void>();
  readonly openNewTabClicked = output<void>();
  readonly commentAdded = output<string>();
  readonly commentDeleted = output<string>();
  readonly contentSaved = output<string>();

  // Layout Controls State
  readonly zoomLevel = signal<number>(100);
  readonly isEditMode = signal<boolean>(false);
  readonly isCommentsOpen = signal<boolean>(false);
  readonly markdownViewMode = signal<'preview' | 'raw'>('preview');

  // Editable local content signal
  readonly editableContent = signal<string>('');

  @ViewChild('documentContainer') documentContainer?: ElementRef<HTMLDivElement>;

  // Icons
  readonly lucideXIcon = lucideX;
  readonly lucideZoomInIcon = lucideZoomIn;
  readonly lucideZoomOutIcon = lucideZoomOut;
  readonly lucideDownloadIcon = lucideDownload;
  readonly lucidePrinterIcon = lucidePrinter;
  readonly lucideExternalLinkIcon = lucideExternalLink;
  readonly lucideMessageSquareIcon = lucideMessageSquare;
  readonly lucideEditIcon = lucidePencil;
  readonly lucideEyeIcon = lucideEye;
  readonly lucideCodeIcon = lucideCode;
  readonly lucideFileTextIcon = lucideFileText;
  readonly lucideSaveIcon = lucideSave;

  constructor() {
    effect(() => {
      this.editableContent.set(this.fileContent());
    });
  }

  readonly isMarkdown = computed(() => {
    return this.fileName().toLowerCase().endsWith('.md');
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
    if (!this.canEdit()) return;
    this.isEditMode.update(mode => !mode);
  }

  toggleComments(): void {
    this.isCommentsOpen.update(open => !open);
  }

  setMarkdownView(mode: 'preview' | 'raw'): void {
    this.markdownViewMode.set(mode);
  }

  onTextareaInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.editableContent.set(value);
  }

  saveChanges(): void {
    this.contentSaved.emit(this.editableContent());
    this.isEditMode.set(false);
  }

  closeLayout(): void {
    this.isEditMode.set(false);
    this.closed.emit();
  }
}