import { Component, computed, effect, ElementRef, HostListener, inject, input, output, signal, ViewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { lucideCode, lucideDownload, lucideExternalLink, lucideEye, lucideFileText, lucideMessageSquare, lucidePencil, lucidePrinter, lucideRotateCcw, lucideSave, lucideX, lucideZoomIn, lucideZoomOut } from '@ng-icons/lucide';
import { FileCommentsPanelComponent } from '../file-comments-panel-component/file-comments-panel-component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { FormControl } from '@angular/forms';
import { CustomTextarea } from '../../common/custom-text-area/custom-text-area';

@Component({
  selector: 'app-file-preview-layout-component',
  standalone: true,
  imports: [
    NgIcon,
    CustomButton,
    FileCommentsPanelComponent,
    CustomTextarea
  ],
  templateUrl: './file-preview-layout-component.html',
  styleUrl: './file-preview-layout-component.css',
})
//Principal file preview layout component
export class FilePreviewLayoutComponent {

  // Dependencies
  private readonly sanitizer = inject(DomSanitizer);

  // Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly fileName = input<string>('Documento_Sin_Titulo.txt');
  readonly fileContent = input<string>('');
  readonly comments = input<FileComment[]>([]);
  readonly canEdit = input<boolean>(true);

  readonly closed = output<void>();
  readonly downloadClicked = output<void>();
  readonly openNewTabClicked = output<void>();
  readonly commentAdded = output<string>();
  readonly commentDeleted = output<string>();
  readonly contentSaved = output<string>();

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
      const content = this.fileContent();
      this.contentControl.setValue(content);
      this.editableContent.set(content);
    });

    // Keep editableContent in sync when typing inside custom textarea
    this.contentControl.valueChanges.subscribe(val => {
      this.editableContent.set(val);
    });
  }

  // Computed to parse Markdown into safe HTML using marked (The reliable way)
  readonly renderedMarkdown = computed<SafeHtml>(() => {
    const rawContent = this.editableContent();
    const parsedHtml = marked.parse(rawContent) as string;
    return this.sanitizer.bypassSecurityTrustHtml(parsedHtml);
  });

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

  saveChanges(): void {
    this.contentSaved.emit(this.editableContent());
    this.isEditMode.set(false);
  }

  // Method to handle file download using a temporary Blob URL
  downloadFile(): void {
    const content = this.editableContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = this.fileName();
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

  closeLayout(): void {
    this.isEditMode.set(false);
    this.closed.emit();
  }
}