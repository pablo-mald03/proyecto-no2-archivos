import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthCookieService } from '../service/auth-cookie.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type AuthUser } from 'src/users/models/auth-user.model';

//Auth controller
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    //Dependencies
    constructor(
        private readonly auth: AuthService,
        private readonly cookies: AuthCookieService,
    ) { }

    /*
     * Endpoint to excecute the login to the application
    */
    @Public()
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login at the application' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.auth.login(dto);
        this.cookies.setSession(res, accessToken, refreshToken);
        return user;
    }

    /*
     * Endpoint to excecute the refresh token activity
    */
    @Public()
    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Renew the cookie session' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.auth.refresh(
            this.cookies.readRefreshToken(req),
        );
        this.cookies.setSession(res, accessToken, refreshToken);
        return user;
    }

    /*
     * Endpoint to excecute the auth me verification
    */
    @Get('me')
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Verify if the user is login in' })
    me(@CurrentUser() user: AuthUser) {
        return user;
    }


    /**
     * Endpoint to excecute the logout to the API
     * 
    */
    @Public()
    @Post('logout')
    @HttpCode(204)
    @ApiOperation({ summary: 'Logout at the application' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        await this.auth.logout(this.cookies.readRefreshToken(req));
        this.cookies.clear(res);
    }
}