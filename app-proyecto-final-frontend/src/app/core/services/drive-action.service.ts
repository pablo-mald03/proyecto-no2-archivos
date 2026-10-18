import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
//Principal service to trow the signal to upload a new file
export class DriveActionService {
  readonly uploadTriggered = signal<boolean>(false);

  //Service to trigger the action of upload
  triggerUpload(): void {
    this.uploadTriggered.set(true);
    setTimeout(() => this.uploadTriggered.set(false), 50);
  }
}