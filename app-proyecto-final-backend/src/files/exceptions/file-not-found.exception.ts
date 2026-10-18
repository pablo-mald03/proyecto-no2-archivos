import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

export class FileNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super(id ? `Archivo con ID '${id}' no encontrado` : 'Archivo no encontrado');
  }
}
