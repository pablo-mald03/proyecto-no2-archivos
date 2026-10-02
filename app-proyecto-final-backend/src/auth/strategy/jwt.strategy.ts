import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UsersRepository } from 'src/users/repository/users.repository';
import { AuthenticationException } from 'src/common/exceptions/authentication.exception';
import { UserDisabledException } from 'src/common/exceptions/user-disabled.exception';
import { JwtPayload } from '../payload/jwt-payload.entity';
import { AuthUserService } from '../service/auth-user.service';
import { AuthUser } from 'src/users/models/auth-user.model';

//Principal Jwt validator strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        cfg: ConfigService,
        private readonly users: UsersRepository,
        private readonly authUsers: AuthUserService,
    ) {
        const cookieName = cfg.getOrThrow<string>('COOKIE_NAME');
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.[cookieName] ?? null,
            ]),
            secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload): Promise<AuthUser> {
        const user = await this.users.findById(payload.sub);
        if (!user) throw new AuthenticationException();
        if (!user.isActive) throw new UserDisabledException();
        return this.authUsers.fromUser(user);
    }
}