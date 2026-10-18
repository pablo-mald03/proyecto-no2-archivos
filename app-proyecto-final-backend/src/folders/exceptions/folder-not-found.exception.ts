import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

export class FolderNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super(id ? `Carpeta con ID '${id}' no encontrada` : 'Carpeta no encontrada');
  }
}
