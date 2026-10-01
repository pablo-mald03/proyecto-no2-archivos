import { HttpException, HttpStatus } from "@nestjs/common";

//Principal exception class for the application
export class AppException extends HttpException {
    constructor(
        public readonly code: string,
        message: string,
        status: HttpStatus,
        public readonly errors: Record<string, string> = {},
    ) {
        super(message, status);
    }
}

