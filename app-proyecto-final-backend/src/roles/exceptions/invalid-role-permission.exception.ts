import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

/*Principal invalid role permission exception class */
export class InvalidRolePermissionsException extends BusinessRuleException {
  constructor(message: string) { super('Los permisos del rol no son válidos', { permissions: message }); }
}