import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { UsersRepository } from 'src/users/repository/users.repository';
import { PasswordService } from 'src/users/service/password.service';
import { RefreshTokensRepository } from '../../refresh-tokens/repository/refresh-tokens.repository';
import { LoginDto } from '../dto/login.dto';
import { AuthenticationException } from 'src/common/exceptions/authentication.exception';
import { UserDisabledException } from 'src/common/exceptions/user-disabled.exception';
import { UserDocument } from 'src/users/entities/user.entity';
import { AuthUserService } from './auth-user.service';

//Principal auth service for the API
@Injectable()
export class AuthService {
    private dummyHash?: Promise<string>;
    private readonly refreshTtlSeconds: number;

    constructor(
        cfg: ConfigService,
        private readonly users: UsersRepository,
        private readonly passwords: PasswordService,
        private readonly jwt: JwtService,
        private readonly refreshTokens: RefreshTokensRepository,
        private readonly authUsers: AuthUserService,
    ) {
        this.refreshTtlSeconds = cfg.getOrThrow<number>('REFRESH_EXPIRES_IN_SECONDS');
    }

    async login(dto: LoginDto) {
        const user = await this.users.findByEmailWithPassword(dto.email);

        this.dummyHash ??= this.passwords.hash('dummy-password');
        const valid = await this.passwords.compare(
            dto.password,
            user?.passwordHash ?? (await this.dummyHash),
        );

        if (!user || !valid) throw new AuthenticationException('Credenciales inválidas');
        if (!user.isActive) throw new UserDisabledException();

        await this.users.touchLastLogin(user.id);
        return this.issueSession(user);
    }

    async refresh(rawRefreshToken?: string) {
        if (!rawRefreshToken) throw new AuthenticationException('Sesión no válida');

        const stored = await this.refreshTokens.consume(this.hashToken(rawRefreshToken));
        if (!stored) throw new AuthenticationException('La sesión ha expirado');

        const user = await this.users.findById(stored.userId.toString());
        if (!user) throw new AuthenticationException();
        if (!user.isActive) throw new UserDisabledException();

        return this.issueSession(user);
    }

    async logout(rawRefreshToken?: string): Promise<void> {
        if (rawRefreshToken) {
            await this.refreshTokens.revoke(this.hashToken(rawRefreshToken));
        }
    }

    private async issueSession(user: UserDocument) {
        const accessToken = await this.jwt.signAsync({ sub: user.id });
        const refreshToken = randomBytes(48).toString('base64url');

        await this.refreshTokens.create(
            user.id,
            this.hashToken(refreshToken),
            new Date(Date.now() + this.refreshTtlSeconds * 1000),
        );

        return { accessToken, refreshToken, user: await this.authUsers.fromUser(user) };
    }

    // Encriptation method
    private hashToken(raw: string): string {
        return createHash('sha256').update(raw).digest('hex');
    }
}