import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal role already in use exception class
export class RoleInUseException extends BusinessRuleException {
  constructor(users: number) { super(`No se puede desactivar el rol: tiene ${users} usuario(s) asignado(s)`); }
}