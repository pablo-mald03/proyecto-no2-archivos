import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthCookieService } from '../service/auth-cookie.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';

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
    @ApiOperation({ summary: 'Login at the application' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const { token, user } = await this.auth.login(dto);
        this.cookies.set(response, token);
        return user;
    }

    @Post('logout')
    @HttpCode(204)
    @ApiCookieAuth('access_token')
    logout(@Res({ passthrough: true }) response: Response) {
        this.cookies.clear(response);
    }
}