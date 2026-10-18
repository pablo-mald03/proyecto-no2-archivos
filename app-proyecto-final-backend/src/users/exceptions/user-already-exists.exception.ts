import { ResourceConflictException } from "src/common/exceptions/resource-conflict.exception";

/*User already exists exception */
export class UserAlreadyExistsException extends ResourceConflictException {
  constructor(errors: Record<string, string>) { super('Ya existe un usuario con esos datos'); }
}
