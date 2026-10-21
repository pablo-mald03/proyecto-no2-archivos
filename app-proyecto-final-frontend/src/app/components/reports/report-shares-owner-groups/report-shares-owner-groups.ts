import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconType, NgIcon } from '@ng-icons/core';
import { ReportSharesAvatar } from '../report-shares-avatar/report-shares-avatar';
import { ShareFlowEntry } from '../../../core/ui/report-shares-shared/types/share-flow-entry.model';
import { ShareOwnerGroup } from '../../../core/ui/report-shares-shared/types/share-owner-group.model';
import { AccessLevelStyle, getAccessLevelStyle } from '../../../core/ui/report-shares-shared/utils/access-level-style.util';
import { getResourceIcon, getResourceIconClass } from '../../../core/ui/report-shares-shared/utils/resource-icon.util';

@Component({
  selector: 'app-report-shares-owner-groups',
  standalone: true,
  imports: [NgIcon, DatePipe, ReportSharesAvatar],
  templateUrl: './report-shares-owner-groups.html',
  styleUrl: './report-shares-owner-groups.css',
})
/*Inbox-style cards with the received resources grouped by owner */
export class ReportSharesOwnerGroups {

  // Inputs
  entries = input.required<ShareFlowEntry[]>();

  // Entries grouped by owner
  readonly groups = computed<ShareOwnerGroup[]>(() => {
    const groups = new Map<string, ShareOwnerGroup>();

    for (const entry of this.entries()) {
      const key = entry.counterpartEmail || entry.counterpartName;
      const group = groups.get(key) ?? {
        key,
        name: entry.counterpartName,
        email: entry.counterpartEmail,
        entries: []
      };

      group.entries.push(entry);
      groups.set(key, group);
    }

    return [...groups.values()].sort((a, b) => b.entries.length - a.entries.length);
  });

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
