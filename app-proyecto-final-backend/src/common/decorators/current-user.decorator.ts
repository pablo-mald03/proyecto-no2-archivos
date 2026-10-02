import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthUser } from 'src/users/models/auth-user.model';

//Principal current user check decorator
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthUser =>
        ctx.switchToHttp().getRequest<Request>().user as AuthUser,
);