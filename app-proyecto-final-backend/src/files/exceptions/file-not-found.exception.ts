import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

/*Principal file not found exception class*/
export class FileNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super(id ? `Archivo con ID '${id}' no encontrado` : 'Archivo no encontrado');
  }
}
