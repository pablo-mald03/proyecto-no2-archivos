import { HttpStatus } from "@nestjs/common";
import { AppException } from "./app.exception";

//Principal exception when the request violates a rule
export class BusinessRuleException extends AppException {
    constructor(message: string) {
        super('BUSINESS_RULE_ERROR', message, HttpStatus.BAD_REQUEST);
    }
}

