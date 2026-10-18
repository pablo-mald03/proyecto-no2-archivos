import { BusinessRuleException } from 'src/common/exceptions/business-rule.exception';

export class InvalidShareException extends BusinessRuleException {
  constructor(message: string, errors?: Record<string, string>) {
    super(message, errors);
  }
}
