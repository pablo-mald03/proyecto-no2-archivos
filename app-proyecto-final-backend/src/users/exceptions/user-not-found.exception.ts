import { ResourceNotFoundException } from "src/common/exceptions/resource-not-found.exception";


export class UserNotFoundException extends ResourceNotFoundException {
  constructor() { super('Usuario no encontrado'); }
}
