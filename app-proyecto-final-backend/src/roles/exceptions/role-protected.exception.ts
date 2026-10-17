import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal role protected exception
export class RoleProtectedException extends BusinessRuleException {
  constructor(message: string) { super(message); }
}
