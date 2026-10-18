import { BusinessRuleException } from "src/common/exceptions/business-rule.exception";

//Principal self action not allowed exception
export class SelfActionNotAllowedException extends BusinessRuleException {
  constructor(message: string) { super(message); }
}