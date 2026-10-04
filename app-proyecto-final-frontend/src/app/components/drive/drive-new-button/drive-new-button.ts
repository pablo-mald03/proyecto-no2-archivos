import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { lucideFolderPlus, lucidePlus, lucideUpload } from '@ng-icons/lucide';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';

@Component({
  selector: 'app-drive-new-button',
  imports: [NgIcon, CustomButton],
  templateUrl: './drive-new-button.html',
  styleUrl: './drive-new-button.css',
})
//Principal drive new button component
export class DriveNewButton {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly lucidePlusIcon = lucidePlus;
  readonly lucideUploadIcon = lucideUpload;
  readonly lucideFolderPlusIcon = lucideFolderPlus;

  collapsed = input(false);
  uploadClicked = output<void>();
  folderClicked = output<void>();

  readonly open = signal(false);

  //Method to toogle the action
  toggle(): void {
    this.open.update(value => !value);
  }

  //Signal to upload a new data
  upload(): void {
    this.open.set(false);
    this.uploadClicked.emit();
  }

  //Signal to create a new folder
  newFolder(): void {
    this.open.set(false);
    this.folderClicked.emit();
  }

  //Signal to close the modals
  closeOnOutsideClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }
}