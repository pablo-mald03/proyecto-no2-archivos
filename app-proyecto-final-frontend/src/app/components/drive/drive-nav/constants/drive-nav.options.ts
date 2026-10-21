import { lucideFolder, lucideHistory, lucideHouse, lucideTrash2, lucideUsers } from '@ng-icons/lucide';
import { DriveNavOption } from './drive-nav-option.model';

//Principal drive nav options
export const DRIVE_NAV_OPTIONS: DriveNavOption[] = [
  { label: 'Inicio', route: '/drive', icon: lucideHouse },
  { label: 'Mis archivos', route: '/drive/files', icon: lucideFolder },
  { label: 'Compartidos conmigo', route: '/drive/shared', icon: lucideUsers },
  { label: 'Papelera', route: '/drive/trash', icon: lucideTrash2 },
  { label: 'Actividad', route: '/drive/activity', icon: lucideHistory },
];


//Principal drive nav options
export const HOME_NAV_OPTIONS: DriveNavOption[] = [
  { label: 'Mis archivos', route: '/drive/files', icon: lucideFolder },
  { label: 'Compartidos conmigo', route: '/drive/shared', icon: lucideUsers },
  { label: 'Papelera', route: '/drive/trash', icon: lucideTrash2 },
  { label: 'Actividad', route: '/drive/activity', icon: lucideHistory },
];