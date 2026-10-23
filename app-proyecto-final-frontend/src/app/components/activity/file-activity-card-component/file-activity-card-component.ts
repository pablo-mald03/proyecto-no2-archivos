import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideClock, lucideDownload, lucideEye, lucideFileText, lucidePencil, lucideShare2, lucideTrash2, lucideUser } from '@ng-icons/lucide';
import { Log } from '../../../features/logs/models/log.model';

@Component({
  selector: 'app-file-activity-card-component',
  standalone: true,
  imports: [CommonModule, NgIconComponent, DatePipe],
  providers: [
    provideIcons({
      lucideActivity,
      lucideUser,
      lucideClock,
      lucideFileText,
      lucideShare2,
      lucideTrash2,
      lucidePencil,
      lucideEye,
      lucideDownload
    })
  ],
  templateUrl: './file-activity-card-component.html',
  styleUrl: './file-activity-card-component.css',
})
/* Individual activity log card component for timeline display */
export class FileActivityCardComponent {

  readonly log = input.required<Log>();

  readonly actionStyle = computed(() => {
    const action = (this.log().action || '').toUpperCase();

    if (action.includes('SHARE')) {
      return {
        icon: 'lucideShare2',
        textClass: 'text-sky-400',
        bgClass: 'bg-sky-500/10 border-sky-500/20',
        badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
      };
    }
    if (action.includes('DELETE') || action.includes('TRASH')) {
      return {
        icon: 'lucideTrash2',
        textClass: 'text-rose-400',
        bgClass: 'bg-rose-500/10 border-rose-500/20',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      };
    }
    if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('WRITE')) {
      return {
        icon: 'lucidePencil',
        textClass: 'text-amber-400',
        bgClass: 'bg-amber-500/10 border-amber-500/20',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }
    if (action.includes('READ') || action.includes('VIEW')) {
      return {
        icon: 'lucideEye',
        textClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10 border-emerald-500/20',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    }
    if (action.includes('DOWNLOAD')) {
      return {
        icon: 'lucideDownload',
        textClass: 'text-indigo-400',
        bgClass: 'bg-indigo-500/10 border-indigo-500/20',
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      };
    }

    return {
      icon: 'lucideActivity',
      textClass: 'text-primary',
      bgClass: 'bg-primary/10 border-primary/20',
      badgeClass: 'bg-primary/10 text-primary border-primary/20'
    };
  });
}