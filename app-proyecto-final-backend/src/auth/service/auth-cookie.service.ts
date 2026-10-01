import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

/*Principal service for cookie management */
@Injectable()
export class AuthCookieService {
    private readonly name: string;
    private readonly maxAgeMs: number;
    private readonly options: CookieOptions;

    /*Principal configuration for service */
    constructor(cfg: ConfigService) {
        this.name = cfg.getOrThrow<string>('COOKIE_NAME');
        this.maxAgeMs = cfg.getOrThrow<number>('JWT_EXPIRES_IN_SECONDS') * 1000;
        this.options = {
            httpOnly: true,
            secure: cfg.get<string>('NODE_ENV') === 'production',
            sameSite: 'lax',
            path: '/',
        };
    }

    //Helper for cookie name
    get cookieName(): string {
        return this.name;
    }

    //Method to set the cookie
    set(res: Response, token: string): void {
        res.cookie(this.name, token, { ...this.options, maxAge: this.maxAgeMs });
    }

    //Method to clear the cookie
    clear(res: Response): void {
        res.clearCookie(this.name, this.options);
    }
}