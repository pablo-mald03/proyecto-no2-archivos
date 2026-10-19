import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

//Principal exception when share is not found class
export class ShareNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super(id ? `Compartición con ID '${id}' no encontrada` : 'Permiso de compartición no encontrado');
  }
}
