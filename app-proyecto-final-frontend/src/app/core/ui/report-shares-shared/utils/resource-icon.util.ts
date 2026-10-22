import { IconType } from '@ng-icons/core';
import { lucideFile, lucideFolder } from '@ng-icons/lucide';
import { ResourceType } from '../../../../features/report-shared/models/resource-type.model';

//Icon of a resource according to its type
export function getResourceIcon(type: ResourceType): IconType {
  return type === 'FOLDER' ? lucideFolder : lucideFile;
}

//Icon box colors of a resource according to its type
export function getResourceIconClass(type: ResourceType): string {
  return type === 'FOLDER' ? 'bg-amber-950/40 text-amber-400' : 'bg-violet-950/40 text-violet-400';
}
