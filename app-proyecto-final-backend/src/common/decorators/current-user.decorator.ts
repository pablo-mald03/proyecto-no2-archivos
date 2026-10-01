import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthUser {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
}

//Principal current user check decorator
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthUser =>
        ctx.switchToHttp().getRequest<Request>().user as AuthUser,
);