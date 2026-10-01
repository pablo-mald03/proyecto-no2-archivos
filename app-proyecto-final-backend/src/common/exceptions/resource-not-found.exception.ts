import { HttpStatus } from "@nestjs/common";
import { AppException } from "./app.exception";

//Principal exception when the resource was not found
export class ResourceNotFoundException extends AppException {
    constructor(message: string) {
        super('RESOURCE_NOT_FOUND', message, HttpStatus.NOT_FOUND);
    }
}
