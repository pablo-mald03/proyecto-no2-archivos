import { BusinessRuleException } from 'src/common/exceptions/business-rule.exception';

//Principal exception when share is invalid class
export class InvalidShareException extends BusinessRuleException {
  constructor(message: string, errors?: Record<string, string>) {
    super(message, errors);
  }
}
