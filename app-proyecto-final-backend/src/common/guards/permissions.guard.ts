// src/common/guards/permissions.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { Permission } from '../constants/permissions';
import { AuthUser } from 'src/users/models/auth-user.model';
import { AuthenticationException } from '../exceptions/authentication.exception';
import { AccessDeniedException } from '../exceptions/access-deniend.exception';

/*Principal guard for permissions (RBAC helper guard) */
@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(ctx: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<Permission[] | undefined>(
            PERMISSIONS_KEY,
            [ctx.getHandler(), ctx.getClass()],
        );
        if (!required?.length) return true;

        const user = ctx.switchToHttp().getRequest<Request>().user as AuthUser | undefined;
        if (!user) throw new AuthenticationException();

        const granted = new Set(user.permissions);
        if (!required.every((p) => granted.has(p))) throw new AccessDeniedException();
        return true;
    }
}