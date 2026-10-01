import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AUTH_COOKIE_PATH } from 'src/common/constants/api.constants';

/*Principal auth cookie service */
@Injectable()
export class AuthCookieService {
    private readonly accessName: string;
    private readonly refreshName: string;
    private readonly accessMaxAgeMs: number;
    private readonly refreshMaxAgeMs: number;
    private readonly base: CookieOptions;

    //Dependencies
    constructor(cfg: ConfigService) {
        this.accessName = cfg.getOrThrow<string>('COOKIE_NAME');
        this.refreshName = cfg.getOrThrow<string>('REFRESH_COOKIE_NAME');
        this.accessMaxAgeMs = cfg.getOrThrow<number>('JWT_EXPIRES_IN_SECONDS') * 1000;
        this.refreshMaxAgeMs = cfg.getOrThrow<number>('REFRESH_EXPIRES_IN_SECONDS') * 1000;
        this.base = {
            httpOnly: true,
            secure: cfg.get<string>('NODE_ENV') === 'production',
            sameSite: 'lax',
        };
    }

    //Method to set the session
    setSession(res: Response, accessToken: string, refreshToken: string): void {
        res.cookie(this.accessName, accessToken, {
            ...this.base, path: '/', maxAge: this.accessMaxAgeMs,
        });
        res.cookie(this.refreshName, refreshToken, {
            ...this.base, path: AUTH_COOKIE_PATH, maxAge: this.refreshMaxAgeMs,
        });
    }

    //Method to refresh the token
    readRefreshToken(req: Request): string | undefined {
        return req.cookies?.[this.refreshName];
    }

    //Principal method to clear the token
    clear(res: Response): void {
        res.clearCookie(this.accessName, { ...this.base, path: '/' });
        res.clearCookie(this.refreshName, { ...this.base, path: AUTH_COOKIE_PATH });
    }
}