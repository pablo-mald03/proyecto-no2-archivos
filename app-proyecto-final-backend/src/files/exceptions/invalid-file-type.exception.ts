import { BusinessRuleException } from 'src/common/exceptions/business-rule.exception';

/*Principal invalid file type exception class*/
export class InvalidFileTypeException extends BusinessRuleException {
  constructor(message = 'Solo se permiten archivos con extensión .txt y .md') {
    super(message, { file: message });
  }
}
