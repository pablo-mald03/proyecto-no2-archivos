import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

/*Principal folder not found exception class */
export class FolderNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super(id ? `Carpeta con ID '${id}' no encontrada` : 'Carpeta no encontrada');
  }
}
