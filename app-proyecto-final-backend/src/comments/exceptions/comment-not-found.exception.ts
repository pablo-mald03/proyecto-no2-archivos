import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

/*Principal comment not found exception class*/
export class CommentNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super(id ? `Comentario con ID '${id}' no encontrado` : 'Comentario no encontrado');
  }
}
