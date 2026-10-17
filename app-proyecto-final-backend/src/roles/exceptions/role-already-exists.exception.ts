import { ResourceConflictException } from "src/common/exceptions/resource-conflict.exception";

/*Principal role already existe exception */
export class RoleAlreadyExistsException extends ResourceConflictException {
  constructor() { super('Ya existe un rol con ese código', { code: 'El código de rol ya está en uso' }); }
}
