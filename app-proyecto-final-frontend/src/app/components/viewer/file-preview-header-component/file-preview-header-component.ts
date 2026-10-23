import { Component, input, output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { ShareAccessLevel } from '../../../features/shares/constants/share.constants';
import {
  lucideDownload,
  lucideExternalLink,
  lucideEye,
  lucideHistory,
  lucideMessageSquare,
  lucidePencil,
  lucideSave,
  lucideShare2,
  lucideX,
  lucideZoomIn,
  lucideZoomOut
} from '@ng-icons/lucide';

@Component({
  selector: 'app-file-preview-header-component',
  standalone: true,
  imports: [NgIconComponent, CustomButton],
  templateUrl: './file-preview-header-component.html',
  styleUrl: './file-preview-header-component.css'
})
// Header toolbar component for the file preview layout component
export class FilePreviewHeaderComponent {

  // Inputs
  readonly fileName = input.required<string>();
  readonly isRouted = input<boolean>(false);
  readonly isOwner = input<boolean>(false);
  readonly accessLevel = input<ShareAccessLevel>('VIEWER');
  readonly zoomLevel = input<number>(100);
  readonly canEdit = input<boolean>(false);
  readonly canShare = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);
  readonly saving = input<boolean>(false);
  readonly isCommentsOpen = input<boolean>(false);
  readonly isActivityOpen = input<boolean>(false); 
  readonly commentsCount = input<number>(0);

  // Outputs
  readonly close = output<void>();
  readonly zoomIn = output<void>();
  readonly zoomOut = output<void>();
  readonly zoomReset = output<void>();
  readonly toggleEdit = output<void>();
  readonly save = output<void>();
  readonly toggleComments = output<void>();
  readonly toggleActivity = output<void>(); 
  readonly openNewTab = output<void>();
  readonly download = output<void>();
  readonly share = output<void>();

  // Icons
  readonly lucideXIcon = lucideX;
  readonly lucideZoomInIcon = lucideZoomIn;
  readonly lucideZoomOutIcon = lucideZoomOut;
  readonly lucideEditIcon = lucidePencil;
  readonly lucideEyeIcon = lucideEye;
  readonly lucideSaveIcon = lucideSave;
  readonly lucideMessageSquareIcon = lucideMessageSquare;
  readonly lucideHistoryIcon = lucideHistory; 
  readonly lucideExternalLinkIcon = lucideExternalLink;
  readonly lucideDownloadIcon = lucideDownload;
  readonly lucideShareIcon = lucideShare2;
}