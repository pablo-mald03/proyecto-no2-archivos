import { ResourceConflictException } from 'src/common/exceptions/resource-conflict.exception';

export class FileNameConflictException extends ResourceConflictException {
  constructor(name: string) {
    super(`Ya existe un archivo con el nombre '${name}' en esta ubicación`, {
      name: `Ya existe un archivo con el nombre '${name}' en esta ubicación`,
    });
  }
}
