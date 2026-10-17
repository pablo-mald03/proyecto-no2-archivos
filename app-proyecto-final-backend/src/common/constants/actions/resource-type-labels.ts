import { ResourceType } from "./resource-type";

/*Resource type labels translator */
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  FILE: 'Archivo',
  FOLDER: 'Carpeta',
  USER: 'Usuario',
  SETTING: 'Regla del sistema',
  ROLE: 'Rol',
};
