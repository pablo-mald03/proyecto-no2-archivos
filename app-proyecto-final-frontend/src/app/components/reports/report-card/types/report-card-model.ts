import { IconType } from "@ng-icons/core";
import { lucideFiles, lucideFolderArchive, lucideFolderOpen, lucideFolderTree, lucideHardDrive, lucideInbox, lucideLock, lucidePipette, lucideSend, lucideShare2, lucideUserCheck } from "@ng-icons/lucide";


//Principal report card config
export interface ReportSection {
    title: string;
    description: string;
    route: string;
    permission: string;
    icon: IconType;
    accentClass: string;
    disabled?: boolean;
}

// Report for users
export const REPORT_USERS: ReportSection[] = [
    {
        title: 'Top 10 usuarios con más archivos',
        description: 'Consulta los usuarios que tienen la mayor cantidad de archivos almacenados.',
        route: 'top-file-count',
        permission: 'REPORTS_USERS_TOP_FILES',
        icon: lucideFiles,
        accentClass: 'bg-primary/10 text-primary'
    },
    {
        title: 'Top 10 usuarios con mayor almacenamiento',
        description: 'Muestra los usuarios que consumen la mayor cantidad de espacio de almacenamiento.',
        route: 'top-storage-used',
        permission: 'REPORTS_USERS_TOP_STORAGE',
        icon: lucideHardDrive,
        accentClass: 'bg-yellow-950/40 text-yellow-400'
    },
    {
        title: 'Porcentaje de almacenamiento por usuario',
        description: 'Porcentaje y bytes consumidos respecto al límite de cuota asignada a cada usuario.',
        route: 'storage-percentage',
        permission: 'REPORTS_USERS_STORAGE_PERCENTAGE',
        icon: lucidePipette,
        accentClass: 'bg-sky-950/40 text-sky-400'
    },
    {
        title: 'Usuarios con mayor cantidad de compartidos',
        description: 'Listado de usuarios que han compartido la mayor cantidad de recursos.',
        route: 'share-count',
        permission: 'REPORTS_USERS_SHARE_COUNT',
        icon: lucideUserCheck,
        accentClass: 'bg-emerald-950/40 text-emerald-400'
    }
];

// Report for shares
export const REPORT_SHARING: ReportSection[] = [
    {
        title: 'Archivos más compartidos',
        description: 'Archivos que han sido compartidos con la mayor cantidad de usuarios.',
        route: 'most-shared-files',
        permission: 'REPORTS_SHARING_MOST_SHARED',
        icon: lucideShare2,
        accentClass: 'bg-primary/10 text-primary'
    },
    {
        title: 'Recursos compartidos por un usuario',
        description: 'Consulta todos los recursos compartidos hacia otros por un usuario seleccionado.',
        route: 'shared-by-user',
        permission: 'REPORTS_SHARING_BY_USER',
        icon: lucideSend,
        accentClass: 'bg-sky-950/40 text-sky-400'
    },
    {
        title: 'Recursos recibidos por un usuario',
        description: 'Consulta todos los recursos que han sido compartidos con un usuario seleccionado.',
        route: 'received-by-user',
        permission: 'REPORTS_SHARING_RECEIVED_BY_USER',
        icon: lucideInbox,
        accentClass: 'bg-yellow-950/40 text-yellow-400'
    },
    {
        title: 'Archivos nunca compartidos',
        description: 'Listado de archivos creados que permanecen privados y sin compartir.',
        route: 'never-shared-files',
        permission: 'REPORTS_SHARING_NEVER_SHARED',
        icon: lucideLock,
        accentClass: 'bg-red-950/40 text-red-400'
    }
];

// Report for folders
export const REPORT_FOLDERS: ReportSection[] = [
    {
        title: 'Carpetas con mayor cantidad de archivos',
        description: 'Consulta las carpetas que alojan la mayor densidad de archivos.',
        route: 'top-files-per-folder',
        permission: 'REPORTS_FOLDERS_TOP_FILES',
        icon: lucideFolderTree,
        accentClass: 'bg-primary/10 text-primary'
    },
    {
        title: 'Espacio en carpetas principales',
        description: 'Almacenamiento utilizado por las carpetas raíz de un usuario seleccionado.',
        route: 'root-folders-storage',
        permission: 'REPORTS_FOLDERS_ROOT_STORAGE',
        icon: lucideFolderArchive,
        accentClass: 'bg-emerald-950/40 text-emerald-400'
    },
    {
        title: 'Contenido y subcarpetas de una carpeta',
        description: 'Explora la estructura completa y el contenido descendiente de una carpeta específica.',
        route: 'folder-content-tree',
        permission: 'REPORTS_FOLDERS_CONTENT_TREE',
        icon: lucideFolderOpen,
        accentClass: 'bg-amber-950/40 text-amber-400'
    }
];