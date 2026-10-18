import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal exception for invalid change password
export class InvalidPasswordChangeException extends BusinessRuleException {
  constructor(errors: Record<string, string>) { super('No se pudo cambiar la contraseña', errors); }
}