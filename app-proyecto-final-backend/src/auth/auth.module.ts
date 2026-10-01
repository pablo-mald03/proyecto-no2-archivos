import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controller/auth.controller';
import { AuthCookieService } from './service/auth-cookie.service';
import { AuthService } from './service/auth.service';
import { PasswordService } from 'src/users/service/password.service';
import { JwtStrategy } from './strategy/jwt.strategy';


//Principal module pipeline for users
@Global()
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.getOrThrow<number>('JWT_EXPIRES_IN_SECONDS') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthCookieService, PasswordService, JwtStrategy],
  exports: [AuthCookieService, PasswordService],
})
export class AuthModule { }
