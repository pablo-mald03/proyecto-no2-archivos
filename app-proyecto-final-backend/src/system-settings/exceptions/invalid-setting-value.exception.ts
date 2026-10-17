import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal invalid setting value exception class
export class InvalidSettingValueException extends BusinessRuleException {
  constructor(message: string) { super('El valor de la regla no es válido', { value: message }); }
}