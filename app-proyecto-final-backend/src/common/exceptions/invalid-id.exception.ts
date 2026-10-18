import { BusinessRuleException } from "./business-rule.exception";

/*Principal invalid or malformed data exception */
export class InvalidIdException extends BusinessRuleException {
  constructor() { super('El identificador no es válido'); }
}
