import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenEntity, RefreshTokenSchema } from './entities/refresh-token.entity';
import { RefreshTokensRepository } from './repository/refresh-tokens.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: RefreshTokenEntity.name,
                schema: RefreshTokenSchema,
            },
        ]),
    ],
    providers: [
        RefreshTokensRepository,
    ],
    exports: [
        RefreshTokensRepository,
    ],
})
export class RefreshTokensModule { }
