import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { IconType, NgIcon } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';
import { ReportSharesAvatar } from '../report-shares-avatar/report-shares-avatar';
import { ShareFlowEntry } from '../../../core/ui/report-shares-shared/types/share-flow-entry.model';
import { AccessLevelStyle, getAccessLevelStyle } from '../../../core/ui/report-shares-shared/utils/access-level-style.util';
import { getResourceIcon, getResourceIconClass } from '../../../core/ui/report-shares-shared/utils/resource-icon.util';


@Component({
  selector: 'app-report-shares-timeline',
  standalone: true,
  imports: [NgIcon, DatePipe, ReportSharesAvatar],
  templateUrl: './report-shares-timeline.html',
  styleUrl: './report-shares-timeline.css',
})
/*Vertical timeline of shares, each dot colored by its access level */
export class ReportSharesTimeline {

  // Inputs
  entries = input.required<ShareFlowEntry[]>();

  direction = input<'out' | 'in'>('out');

  readonly lucideArrowRightIcon = lucideArrowRight;

  // Helper method to get access level style
  accent(entry: ShareFlowEntry): AccessLevelStyle {
    return getAccessLevelStyle(entry.accessLevel);
  }

  // Helper method to get resource icon
  icon(entry: ShareFlowEntry): IconType {
    return getResourceIcon(entry.resourceType);
  }

  // Helper method to get resource icon colors
  iconClass(entry: ShareFlowEntry): string {
    return getResourceIconClass(entry.resourceType);
  }
}
