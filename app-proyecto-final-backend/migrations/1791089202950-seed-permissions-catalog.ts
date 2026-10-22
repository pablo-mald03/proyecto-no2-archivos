import type { Connection } from 'mongoose';

type PermissionSeed = readonly [code: string, module: string, name: string, description: string];

// Principal migration for frozen snapshot of the catalog at this point in time
const PERMISSIONS: readonly PermissionSeed[] = [
  ['DRIVE_ACCESS', 'BUSINESS', 'Acceso al drive', 'Usar el drive propio y acceder a lo que otros usuarios compartan'],

  ['ADMINISTRATION_VIEW', 'ADMINISTRATION', 'Acceder a administración', 'Acceder al módulo de administración de usuarios, roles y permisos'],
  ['USERS_VIEW', 'USERS', 'Ver usuarios', 'Listar y consultar usuarios, su perfil y su espacio usado'],
  ['USERS_CREATE', 'USERS', 'Crear usuarios', 'Crear nuevos usuarios en la plataforma'],
  ['USERS_UPDATE', 'USERS', 'Editar usuarios', 'Editar los datos de un usuario (nombre de usuario, correo y nombres)'],
  ['USERS_CHANGE_STATUS', 'USERS', 'Cambiar estado de usuarios', 'Activar y desactivar usuarios'],
  ['USERS_ASSIGN_ROLE', 'USERS', 'Asignar rol a usuarios', 'Cambiar el rol asignado a un usuario'],
  ['USERS_QUOTA_UPDATE', 'USERS', 'Modificar cuota de usuarios', 'Modificar la cuota de almacenamiento de un usuario'],

  ['ROLES_VIEW', 'ROLES', 'Ver roles', 'Consultar los roles y el catálogo de permisos'],
  ['ROLES_CREATE', 'ROLES', 'Crear roles', 'Crear nuevos roles'],
  ['ROLES_UPDATE', 'ROLES', 'Editar roles', 'Editar el nombre y la descripción de un rol'],
  ['ROLES_DELETE', 'ROLES', 'Eliminar roles', 'Eliminar roles que no sean del sistema'],
  ['ROLES_PERMISSIONS_UPDATE', 'ROLES', 'Gestionar permisos de roles', 'Agregar o quitar permisos de un rol'],

  ['PERMISSIONS_VIEW', 'PERMISSIONS', 'Ver permisos', 'Consultar el catálogo de permisos disponibles'],

  ['SETTINGS_VIEW', 'SETTINGS', 'Ver configuración', 'Consultar las reglas generales del sistema'],
  ['SETTINGS_UPDATE', 'SETTINGS', 'Modificar configuración', 'Modificar las reglas generales del sistema'],

  ['REPORTS_VIEW', 'REPORTS', 'Acceso a reportes', 'Acceso general al módulo de reportes'],

  ['REPORTS_USERS_VIEW', 'REPORTS', 'Ver sección reportes de usuarios', 'Acceder a la sección de reportes de usuarios'],
  ['REPORTS_USERS_TOP_FILES', 'REPORTS', 'Top usuarios con más archivos', 'Consultar el top 10 de usuarios con mayor cantidad de archivos almacenados'],
  ['REPORTS_USERS_TOP_STORAGE', 'REPORTS', 'Top usuarios con más almacenamiento', 'Consultar el top 10 de usuarios con mayor cantidad de almacenamiento utilizado'],
  ['REPORTS_USERS_STORAGE_PERCENTAGE', 'REPORTS', 'Porcentaje de almacenamiento por usuario', 'Consultar el porcentaje de almacenamiento utilizado por cada usuario'],
  ['REPORTS_USERS_SHARE_COUNT', 'REPORTS', 'Usuarios con más recursos compartidos', 'Consultar usuarios con mayor cantidad de recursos compartidos'],

  ['REPORTS_SHARING_VIEW', 'REPORTS', 'Ver sección reportes de compartición', 'Acceder a la sección de reportes de compartición'],
  ['REPORTS_SHARING_MOST_SHARED', 'REPORTS', 'Archivos más compartidos', 'Consultar los archivos compartidos con mayor cantidad de usuarios'],
  ['REPORTS_SHARING_BY_USER', 'REPORTS', 'Recursos compartidos por un usuario', 'Consultar los recursos compartidos por un usuario seleccionado'],
  ['REPORTS_SHARING_RECEIVED_BY_USER', 'REPORTS', 'Recursos recibidos por un usuario', 'Consultar los recursos recibidos por un usuario seleccionado'],
  ['REPORTS_SHARING_NEVER_SHARED', 'REPORTS', 'Archivos nunca compartidos', 'Consultar los archivos que nunca han sido compartidos'],

  ['REPORTS_FOLDERS_VIEW', 'REPORTS', 'Ver sección reportes de carpetas', 'Acceder a la sección de reportes de carpetas'],
  ['REPORTS_FOLDERS_TOP_FILES', 'REPORTS', 'Carpetas con más archivos', 'Consultar las carpetas con mayor cantidad de archivos'],
  ['REPORTS_FOLDERS_ROOT_STORAGE', 'REPORTS', 'Espacio en carpetas principales', 'Consultar el espacio utilizado por las carpetas principales de un usuario'],
  ['REPORTS_FOLDERS_CONTENT_TREE', 'REPORTS', 'Contenido y subcarpetas de carpeta', 'Consultar el contenido de una carpeta seleccionada y sus subcarpetas'],

  ['REPORTS_ACTIVITY_VIEW', 'REPORTS', 'Reportes de actividad', 'Consultar los reportes de actividad del sistema'],

  ['ACTIVITY_VIEW_ALL', 'ACTIVITY', 'Ver toda la actividad', 'Consultar el historial de actividad de cualquier usuario'],

  ['FILES_METADATA_VIEW_ALL', 'FILES', 'Ver metadatos de archivos ajenos', 'Ver los metadatos de cualquier archivo'],
  ['FOLDERS_METADATA_VIEW_ALL', 'FOLDERS', 'Ver metadatos de carpetas ajenas', 'Ver los metadatos de cualquier carpeta'],
  ['FILES_CONTENT_AUDIT', 'FILES', 'Auditar contenido de archivos', 'Abrir el contenido de archivos ajenos; cada uso queda registrado como CONTENT_AUDITED'],
];

export async function up(connection: Connection): Promise<void> {
  const now = new Date();

  await connection.collection('permissions').bulkWrite(
    PERMISSIONS.map(([code, module, name, description]) => ({
      updateOne: {
        filter: { code },
        update: { $setOnInsert: { module, name, description, createdAt: now, updatedAt: now } },
        upsert: true,
      },
    })),
  );
}

export async function down(connection: Connection): Promise<void> {
  await connection
    .collection('permissions')
    .deleteMany({ code: { $in: PERMISSIONS.map(([code]) => code) } });
}