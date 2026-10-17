import { ResourceNotFoundException } from "src/common/exceptions/resource-not-found.exception";

/*Principal role not found exception */
export class RoleNotFoundException extends ResourceNotFoundException {
  constructor() { super('Rol no encontrado'); }
}
