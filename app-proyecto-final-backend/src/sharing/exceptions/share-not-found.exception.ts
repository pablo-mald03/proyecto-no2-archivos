import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

export class ShareNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super(id ? `Compartición con ID '${id}' no encontrada` : 'Permiso de compartición no encontrado');
  }
}
