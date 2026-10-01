import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthCookieService } from '../service/auth-cookie.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { AuthUser, CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly cookies: AuthCookieService,
    ) { }

    @Public()
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Iniciar sesión' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.auth.login(dto);
        this.cookies.setSession(res, accessToken, refreshToken);
        return user;
    }

    @Public()
    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Renovar la sesión con la cookie de refresh' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.auth.refresh(
            this.cookies.readRefreshToken(req),
        );
        this.cookies.setSession(res, accessToken, refreshToken);
        return user;
    }

    // @Get('me')
    // @ApiOperation({ summary: 'Usuario de la sesión actual' })
    // me(@CurrentUser() user: AuthUser) {
    //     return user;
    // }


    @Public()
    @Post('logout')
    @HttpCode(204)
    @ApiOperation({ summary: 'Cerrar sesión' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        await this.auth.logout(this.cookies.readRefreshToken(req));
        this.cookies.clear(res);
    }
}