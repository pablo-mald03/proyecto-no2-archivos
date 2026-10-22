
import { IconType } from '@ng-icons/core';
import {
    lucideLayoutDashboard,
    lucideUsers,
    lucideSettings,
    lucideShield,
    lucideKey,
    lucideLogs,
    lucideSettings2,
    lucideUsersRound,
    lucideFolder,
    lucideScreenShare,
    lucideFileArchive
} from '@ng-icons/lucide';

//Sidebar option menu model
export interface SidebarOption {
    label: string;
    route?: string;
    icon: IconType;
    permission?: string;
    children?: SidebarOption[];
}
/*Principal side bar options */
export const SIDEBAR_OPTIONS: SidebarOption[] = [

    {
        label: 'Dashboard',
        route: '/dashboard',
        icon: lucideLayoutDashboard
    },
    {
        label: 'Reportes',
        route: '/dashboard/reports',
        icon: lucideFileArchive,
        permission: 'REPORTS_ACTIVITY_VIEW',
        children: [
            {
                label: 'Reporte de usuarios',
                route: '/dashboard/reports/users',
                icon: lucideUsersRound,
                permission: 'REPORTS_USERS_VIEW'
            },
            {
                label: 'Reporte de compartidos',
                route: '/dashboard/reports/sharing',
                icon: lucideScreenShare,
                permission: 'REPORTS_SHARING_VIEW'
            },
            {
                label: 'Reporte de carpetas',
                route: '/dashboard/reports/folders',
                icon: lucideFolder,
                permission: 'REPORTS_FOLDERS_VIEW'
            },
        ]
    },
    {
        label: 'Actividad',
        route: '/dashboard/activity',
        icon: lucideLogs,
        permission: 'REPORTS_ACTIVITY_VIEW'
    },
    {
        label: 'Administración',
        icon: lucideSettings,
        permission: 'ADMINISTRATION_VIEW',
        children: [
            {
                label: 'Usuarios',
                route: '/dashboard/administration/users',
                icon: lucideUsers,
                permission: 'USERS_VIEW'
            },
            {
                label: 'Roles',
                route: '/dashboard/administration/roles',
                icon: lucideShield,
                permission: 'ROLES_VIEW'
            },
            {
                label: 'Permisos',
                route: '/dashboard/administration/permissions',
                icon: lucideKey,
                permission: 'ROLES_VIEW'
            }
        ]
    },
    {
        label: 'Configuraciones',
        route: '/dashboard/settings',
        icon: lucideSettings2,
        permission: 'SETTINGS_VIEW'
    }

];