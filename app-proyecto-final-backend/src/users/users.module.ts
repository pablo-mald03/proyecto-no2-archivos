import { Module } from '@nestjs/common';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { UsersRepository } from './repository/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './entities/user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-token.module';
import { ActivityModule } from 'src/activity/activity.module';
import { PasswordModule } from 'src/password/password.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    RolesModule, RefreshTokensModule, ActivityModule, PasswordModule,
  ],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository],
})
export class UsersModule {}