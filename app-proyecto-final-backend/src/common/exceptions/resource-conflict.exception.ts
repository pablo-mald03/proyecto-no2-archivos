import { HttpStatus } from "@nestjs/common";
import { AppException } from "./app.exception";

//Principal exception when the resource make a conflict with any rule
export class ResourceConflictException extends AppException {
    constructor(message: string, errors?: Record<string, string>) {
        super('CONFLICT', message, HttpStatus.CONFLICT, errors);
    }
}

