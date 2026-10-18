import { BusinessRuleException } from 'src/common/exceptions/business-rule.exception';

export class FolderCycleException extends BusinessRuleException {
  constructor(message = 'No se puede mover una carpeta dentro de sí misma o de una subcarpeta descendiente') {
    super(message);
  }
}
