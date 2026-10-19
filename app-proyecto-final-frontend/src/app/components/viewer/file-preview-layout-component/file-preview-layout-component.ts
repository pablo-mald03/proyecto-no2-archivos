import { Component, computed, ElementRef, HostListener, input, output, signal, ViewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { FileCommentsPanelComponent } from '../file-comments-panel-component/file-comments-panel-component';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { lucideDownload, lucideExternalLink, lucideEye, lucideMessageSquare, lucidePencil, lucidePrinter, lucideRotateCcw, lucideX, lucideZoomIn, lucideZoomOut } from '@ng-icons/lucide';

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

  // Layout Controls State
  readonly zoomLevel = signal<number>(100);
  readonly isEditMode = signal<boolean>(false);
  readonly isCommentsOpen = signal<boolean>(false);

  // Reference for backdrop click check
  @ViewChild('documentContainer') documentContainer?: ElementRef<HTMLDivElement>;

  // Icons
  readonly lucideXIcon = lucideX;
  readonly lucideZoomInIcon = lucideZoomIn;
  readonly lucideZoomOutIcon = lucideZoomOut;
  readonly lucideResetIcon = lucideRotateCcw;
  readonly lucideDownloadIcon = lucideDownload;
  readonly lucidePrinterIcon = lucidePrinter;
  readonly lucideExternalLinkIcon = lucideExternalLink;
  readonly lucideMessageSquareIcon = lucideMessageSquare;
  readonly lucideEditIcon = lucidePencil;
  readonly lucideEyeIcon = lucideEye;

  // Computed to detect if current file is Markdown
  readonly isMarkdown = computed(() => {
    return this.fileName().toLowerCase().endsWith('.md');
  });

  // HostListener to close modal on ESC key press
  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    if (this.isOpen()) {
      this.closeLayout();
    }
  }

  // Backdrop click handler to close when clicking outside the document container
  onBackdropClick(event: MouseEvent): void {
    if (this.documentContainer && !this.documentContainer.nativeElement.contains(event.target as Node)) {
      this.closeLayout();
    }
  }

  // Zoom Controls
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
    this.isEditMode.update(mode => !mode);
  }

  toggleComments(): void {
    this.isCommentsOpen.update(open => !open);
  }

  closeLayout(): void {
    this.closed.emit();
  }
}