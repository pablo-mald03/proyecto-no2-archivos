import { Component, DOCUMENT, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { lucideFolderPlus, lucidePlus, lucideUpload } from '@ng-icons/lucide';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';

@Component({
  selector: 'app-drive-new-button',
  standalone: true,
  imports: [NgIcon, CustomButton],
  templateUrl: './drive-new-button.html',
  styleUrl: './drive-new-button.css',
})
// Principal drive new button component
export class DriveNewButton {

  // Dependencies injection for native element reference
  private readonly elementRef = inject(ElementRef);

  // Inputs & Outputs
  readonly collapsed = input(false);
  readonly uploadClicked = output<void>();
  readonly folderClicked = output<void>();

  // State signal
  readonly open = signal(false);

  // Icons
  readonly lucidePlusIcon = lucidePlus;
  readonly lucideUploadIcon = lucideUpload;
  readonly lucideFolderPlusIcon = lucideFolderPlus;

  // Toggle dropdown state 
  toggle(): void {
    this.open.update(value => !value);
  }

  // Close dropdown when clicking outside using native ElementRef check
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.open.set(false);
    }
  }

  upload(): void {
    this.open.set(false);
    this.uploadClicked.emit();
  }

  newFolder(): void {
    this.open.set(false);
    this.folderClicked.emit();
  }
}