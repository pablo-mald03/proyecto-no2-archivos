import { HttpStatus } from "@nestjs/common";
import { AppException } from "./app.exception";

//Exception wneh the user was disabled
export class UserDisabledException extends AppException {
    constructor(message = 'Usuario desactivado') {
        super('FORBIDDEN', message, HttpStatus.FORBIDDEN);
    }
}