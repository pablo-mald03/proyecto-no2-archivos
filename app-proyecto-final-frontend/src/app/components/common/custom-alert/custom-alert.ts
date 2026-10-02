import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { AlertType } from './types/alert.types';
import { lucideCircleAlert, lucideCircleCheck, lucideCircleX, lucideInfo } from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-alert',
  standalone: true,
  imports: [
    NgIcon
  ],
  templateUrl: './custom-alert.html',
  styleUrl: './custom-alert.css',
})
/*Principal message to show any alert at any section */
export class CustomAlert {

  //Props
  type = input<AlertType>('info');
  message = input.required<string>();
  title = input<string>();

  //Icons
  readonly lucideInfoIcon = lucideInfo;
  readonly lucideSuccessIcon = lucideCircleCheck;
  readonly lucideWarningIcon = lucideCircleAlert;
  readonly lucideErrorIcon = lucideCircleX;

  //Icon evaluation type
  readonly icon = computed(() => {

    switch (this.type()) {

      case 'success':
        return this.lucideSuccessIcon;

      case 'warning':
        return this.lucideWarningIcon;

      case 'error':
        return this.lucideErrorIcon;

      default:
        return this.lucideInfoIcon;
    }

  });

}
