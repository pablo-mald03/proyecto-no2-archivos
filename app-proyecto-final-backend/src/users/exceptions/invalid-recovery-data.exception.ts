import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

/*Exception for the recovery data */
export class InvalidRecoveryDataException extends BusinessRuleException {
  constructor() { super('Los datos proporcionados no coinciden con ninguna cuenta'); }
}