import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { FileUploadQueueService } from '../../../features/files/service/file-upload-queue.service';
import {
  lucideCheck,
  lucideChevronDown,
  lucideChevronUp,
  lucideClock,
  lucideFileText,
  lucideLoader,
  lucideTriangleAlert,
  lucideX
} from '@ng-icons/lucide';

@Component({
  selector: 'app-drive-upload-widget-component',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './drive-upload-widget-component.html',
  styleUrl: './drive-upload-widget-component.css',
})
// Floating background upload widget component
export class DriveUploadWidgetComponent {
  readonly queueService = inject(FileUploadQueueService);

  // Icons
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideChevronUpIcon = lucideChevronUp;
  readonly lucideXIcon = lucideX;
  readonly lucideCheckIcon = lucideCheck;
  readonly lucideFileTextIcon = lucideFileText;
  readonly lucideLoader2Icon = lucideLoader;
  readonly lucideTriangleAlertIcon = lucideTriangleAlert;
  readonly lucideClockIcon = lucideClock;

  //Method to format the size of a file
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
