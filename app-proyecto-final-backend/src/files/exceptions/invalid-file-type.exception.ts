import { BusinessRuleException } from 'src/common/exceptions/business-rule.exception';

export class InvalidFileTypeException extends BusinessRuleException {
  constructor(message = 'Solo se permiten archivos con extensión .txt y .md') {
    super(message, { file: message });
  }
}
