import { Component, computed, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { NgIconComponent } from '@ng-icons/core';
import { CustomTextarea } from '../../common/custom-text-area/custom-text-area';
import { lucideCode, lucideEye } from '@ng-icons/lucide';

@Component({
  selector: 'app-file-preview-content-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, CustomTextarea],
  templateUrl: './file-preview-content-component.html',
  styleUrl: './file-preview-content-component.css'
})
// Main canvas and renderer for markdown, plain text, and editing component
export class FilePreviewContentComponent {
  private readonly sanitizer = inject(DomSanitizer);

  // Inputs
  readonly loading = input<boolean>(false);
  readonly fileName = input<string>('Documento');
  readonly editableContent = input<string>('');
  readonly contentControl = input.required<FormControl<string>>();
  readonly zoomLevel = input<number>(100);
  readonly isEditMode = input<boolean>(false);

  // State
  readonly markdownViewMode = signal<'preview' | 'raw'>('preview');

  @ViewChild('documentContainer') documentContainer?: ElementRef<HTMLDivElement>;

  // Icons
  readonly lucideEyeIcon = lucideEye;
  readonly lucideCodeIcon = lucideCode;

  readonly isMarkdown = computed(() => {
    return (this.fileName() || '').toLowerCase().endsWith('.md');
  });

  readonly renderedMarkdown = computed<SafeHtml>(() => {
    const rawContent = this.editableContent();
    const parsedHtml = marked.parse(rawContent) as string;
    return this.sanitizer.bypassSecurityTrustHtml(parsedHtml);
  });

  setMarkdownView(mode: 'preview' | 'raw'): void {
    this.markdownViewMode.set(mode);
  }
}
