import { BusinessRuleException } from "./business-rule.exception";

/*Principal invalid date range exception */
export class InvalidDateRangeException extends BusinessRuleException {
  constructor() { super('El rango de fechas no es válido', { to: 'La fecha final no puede ser anterior a la inicial' }); }
}