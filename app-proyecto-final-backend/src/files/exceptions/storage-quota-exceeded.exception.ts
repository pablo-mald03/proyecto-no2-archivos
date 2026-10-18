import { BusinessRuleException } from 'src/common/exceptions/business-rule.exception';

export class StorageQuotaExceededException extends BusinessRuleException {
  constructor(message = 'No tienes suficiente espacio de almacenamiento disponible') {
    super(message, { storage: message });
  }
}
