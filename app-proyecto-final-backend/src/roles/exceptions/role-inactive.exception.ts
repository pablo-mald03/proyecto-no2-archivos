import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal role inactive exception
export class RoleInactiveException extends BusinessRuleException {
  constructor() { super('El rol está inactivo y no se puede asignar'); }
}