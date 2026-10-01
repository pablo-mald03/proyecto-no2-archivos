import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AuthCookieService } from '../../auth/auth-cookie.service';
import { ErrorResponse } from '../dto/error-response';
import { AppException } from '../exceptions/app.exception';
import { UserDisabledException } from '../exceptions/user-disabled.exception';

/*Principal rest controller advice handler */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly cookies: AuthCookieService) { }

    //Principal handler for the exceptions
    catch(exception: unknown, host: ArgumentsHost): void {
        const res = host.switchToHttp().getResponse<Response>();
        const { status, body } = this.build(exception);


        if (exception instanceof UserDisabledException) {
            this.cookies.clear(res);
        }

        res.status(status).json(body);
    }

    private build(e: unknown): { status: number; body: ErrorResponse } {
        // Principal application exceptions 
        if (e instanceof AppException) {
            return {
                status: e.getStatus(),
                body: { code: e.code, message: e.message, errors: e.errors },
            };
        }

        // Nest own exceptions
        if (e instanceof HttpException) {
            const status = e.getStatus();
            const map: Record<number, [string, string]> = {
                401: ['UNAUTHORIZED', 'Credenciales invalidas'],
                403: ['FORBIDDEN', 'No tienes permisos para esta operación'],
                404: ['RESOURCE_NOT_FOUND', 'Recurso no encontrado'],
                429: ['TOO_MANY_REQUESTS', 'Demasiadas solicitudes, intenta más tarde'],
            };
            const [code, message] = map[status] ?? ['HTTP_ERROR', e.message];
            return { status, body: { code, message, errors: {} } };
        }

        //Database conflict
        if (typeof e === 'object' && e !== null && 'code' in e && e.code === 11000) {
            return {
                status: HttpStatus.CONFLICT,
                body: {
                    code: 'DATABASE_CONFLICT',
                    message: 'Ocurrió un conflicto con los datos enviados.',
                    errors: {},
                },
            };
        }

        this.logger.error(e instanceof Error ? e.stack : String(e));
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Ocurrió un error inesperado en el servidor. Por favor, intente más tarde.',
                errors: {},
            },
        };
    }
}