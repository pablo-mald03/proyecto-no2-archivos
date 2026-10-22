import { IconType } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideShield } from '@ng-icons/lucide';

export interface AccessLevelStyle {
  label: string;
  icon: IconType;
  dot: string;
  bg: string;
  badge: string;
}

//Known access levels 
const ACCESS_LEVEL_STYLES: Record<string, AccessLevelStyle> = {
  VIEWER: { label: 'Lector', icon: lucideEye, dot: 'bg-sky-500', bg: 'bg-sky-500', badge: 'bg-sky-950/60 text-sky-300' },
  EDITOR: { label: 'Editor', icon: lucidePencil, dot: 'bg-amber-500', bg: 'bg-amber-500', badge: 'bg-amber-950/60 text-amber-300' },
  OWNER: { label: 'Propietario', icon: lucideShield, dot: 'bg-violet-500', bg: 'bg-violet-500', badge: 'bg-violet-950/60 text-violet-300' }
};

//Style of an access level
export function getAccessLevelStyle(level: string): AccessLevelStyle {
  return ACCESS_LEVEL_STYLES[level?.toUpperCase()] ?? {
    label: level,
    icon: lucideShield,
    dot: 'bg-slate-500',
    bg: 'bg-slate-500',
    badge: 'bg-slate-700/50 text-slate-300'
  };
}
