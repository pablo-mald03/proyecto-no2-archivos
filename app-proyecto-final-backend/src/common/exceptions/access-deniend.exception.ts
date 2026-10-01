import { HttpStatus } from "@nestjs/common";
import { AppException } from "./app.exception";

//Principal access denied model exception
export class AccessDeniedException extends AppException {
    constructor(message = 'No tienes permisos para realizar esta accion') {
        super('FORBIDDEN', message, HttpStatus.FORBIDDEN);
    }
}