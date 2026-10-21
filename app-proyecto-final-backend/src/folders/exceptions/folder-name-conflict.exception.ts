import { ResourceConflictException } from 'src/common/exceptions/resource-conflict.exception';

/*Principal folder name conflict exception class */
export class FolderNameConflictException extends ResourceConflictException {
  constructor(name: string) {
    super(`Ya existe una carpeta con el nombre '${name}' en esta ubicación`, {
      name: `Ya existe una carpeta con el nombre '${name}' en esta ubicación`,
    });
  }
}
