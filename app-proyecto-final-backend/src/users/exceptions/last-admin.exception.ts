import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal last admin exception
export class LastAdminException extends BusinessRuleException {
  constructor() { super('Debe existir al menos un administrador activo'); }
}