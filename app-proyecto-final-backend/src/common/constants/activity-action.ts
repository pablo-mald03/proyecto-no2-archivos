
export const ResourceType = { FILE: 'FILE', FOLDER: 'FOLDER', USER: 'USER' } as const;


//Activity logs action
export const ActivityAction = {
    FILE_UPLOADED: 'FILE_UPLOADED',
    FILE_DOWNLOADED: 'FILE_DOWNLOADED',
    FILE_RENAMED: 'FILE_RENAMED',
    FILE_MOVED: 'FILE_MOVED',
    FILE_EDITED: 'FILE_EDITED',
    FILE_TRASHED: 'FILE_TRASHED',
    FILE_RESTORED: 'FILE_RESTORED',
    FILE_DELETED_PERMANENTLY: 'FILE_DELETED_PERMANENTLY',
    FOLDER_CREATED: 'FOLDER_CREATED',
    FOLDER_RENAMED: 'FOLDER_RENAMED',
    FOLDER_MOVED: 'FOLDER_MOVED',
    FOLDER_TRASHED: 'FOLDER_TRASHED',
    FOLDER_RESTORED: 'FOLDER_RESTORED',
    FOLDER_DELETED_PERMANENTLY: 'FOLDER_DELETED_PERMANENTLY',
    ACCESS_GRANTED: 'ACCESS_GRANTED',
    ACCESS_CHANGED: 'ACCESS_CHANGED',
    ACCESS_REVOKED: 'ACCESS_REVOKED',
    COMMENT_ADDED: 'COMMENT_ADDED',
    CONTENT_AUDITED: 'CONTENT_AUDITED',
    USER_LOGGED_IN: 'USER_LOGGED_IN',
    USER_LOGGED_OUT: 'USER_LOGGED_OUT',
    USER_SESSION_REFRESHED: 'USER_SESSION_REFRESHED',
    USER_CREATED: 'USER_CREATED',
    USER_UPDATED: 'USER_UPDATED',
    USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
    USER_ACTIVATED: 'USER_ACTIVATED',
    USER_DEACTIVATED: 'USER_DEACTIVATED',
    USER_QUOTA_CHANGED: 'USER_QUOTA_CHANGED',
    USER_PASSWORD_CHANGED: 'USER_PASSWORD_CHANGED'
} as const;


//Activity actions
export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
    FILE_UPLOADED: 'Archivo subido',
    FILE_DOWNLOADED: 'Archivo descargado',
    FILE_RENAMED: 'Archivo renombrado',
    FILE_MOVED: 'Archivo movido',
    FILE_EDITED: 'Archivo editado',
    FILE_TRASHED: 'Archivo enviado a la papelera',
    FILE_RESTORED: 'Archivo restaurado',
    FILE_DELETED_PERMANENTLY: 'Archivo eliminado definitivamente',
    FOLDER_CREATED: 'Carpeta creada',
    FOLDER_RENAMED: 'Carpeta renombrada',
    FOLDER_MOVED: 'Carpeta movida',
    FOLDER_TRASHED: 'Carpeta enviada a la papelera',
    FOLDER_RESTORED: 'Carpeta restaurada',
    FOLDER_DELETED_PERMANENTLY: 'Carpeta eliminada definitivamente',
    ACCESS_GRANTED: 'Acceso otorgado',
    ACCESS_CHANGED: 'Acceso modificado',
    ACCESS_REVOKED: 'Acceso retirado',
    COMMENT_ADDED: 'Comentario agregado',
    CONTENT_AUDITED: 'Contenido auditado',
    USER_LOGGED_IN: 'Inicio de sesión',
    USER_LOGGED_OUT: 'Cierre de sesión',
    USER_SESSION_REFRESHED: 'Sesión renovada',
    USER_CREATED: 'Usuario creado',
    USER_UPDATED: 'Usuario actualizado',
    USER_ROLE_CHANGED: 'Rol de usuario modificado',
    USER_ACTIVATED: 'Usuario activado',
    USER_DEACTIVATED: 'Usuario desactivado',
    USER_QUOTA_CHANGED: 'Cuota de almacenamiento modificada',
    USER_PASSWORD_CHANGED: 'Contraseña modificada',
};

//Constant export
export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction];