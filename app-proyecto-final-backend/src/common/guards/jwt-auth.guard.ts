import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticationException } from '../exceptions/authentication.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(ctx: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);
        return isPublic ? true : super.canActivate(ctx);
    }

    // Se ejecuta después de que Passport intentó autenticar
    handleRequest<TUser>(err: unknown, user: TUser | false, info: { name?: string } | undefined): TUser {
        if (err) throw err;
        if (!user) {
            if (info?.name === 'TokenExpiredError') {
                throw new AuthenticationException('La sesión ha expirado');
            }
            throw new AuthenticationException();
        }
        return user;
    }
}