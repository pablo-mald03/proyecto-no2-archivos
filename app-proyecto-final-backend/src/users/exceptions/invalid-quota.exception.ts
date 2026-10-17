import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal quota exception
export class InvalidQuotaException extends BusinessRuleException {
  constructor() { super('La cuota no puede ser menor al espacio ya utilizado'); }
}