import { HttpStatus } from "@nestjs/common";
import { AppException } from "./app.exception";

//Principal auth model exception
export class AuthenticationException extends AppException {
    constructor(message = 'No autenticado o token invalido/expirado') {
        super('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
    }
}

