import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/repository/users.repository';
import { PasswordService } from 'src/users/service/password.service';
import { LoginDto } from '../dto/login.dto';
import { AuthenticationException } from 'src/common/exceptions/authentication.exception';
import { UserDisabledException } from 'src/common/exceptions/user-disabled.exception';

//Principal auth service for the API
@Injectable()
export class AuthService {


    private dummyHash?: Promise<string>;

    constructor(
        private readonly users: UsersRepository,
        private readonly passwords: PasswordService,
        private readonly jwt: JwtService,
    ) { }

    async login(dto: LoginDto) {
        const user = await this.users.findByEmailWithPassword(dto.email);

        this.dummyHash ??= this.passwords.hash('dummy-password');
        const valid = await this.passwords.compare(
            dto.password,
            user?.passwordHash ?? (await this.dummyHash),
        );

        if (!user || !valid) {
            throw new AuthenticationException('Credenciales inválidas');
        }
        if (!user.isActive) throw new UserDisabledException();

        const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    }
}