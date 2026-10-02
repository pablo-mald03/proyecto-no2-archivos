import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

//Principal repository for refresh the token
@Injectable()
export class RefreshTokensRepository {
    constructor(
        @InjectModel(RefreshTokenEntity.name) private readonly model: Model<RefreshTokenEntity>,
    ) { }

    create(userId: string, tokenHash: string, expiresAt: Date) {
        return this.model.create({ userId: new Types.ObjectId(userId), tokenHash, expiresAt });
    }

    //Atomic operation for the jwt verification
    consume(tokenHash: string) {
        return this.model
            .findOneAndUpdate(
                { tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } },
                { $set: { revokedAt: new Date() } },
            )
            .exec();
    }

    //Principal method to revoke que jwt
    revoke(tokenHash: string) {
        return this.model
            .updateOne({ tokenHash, revokedAt: null }, { $set: { revokedAt: new Date() } })
            .exec();
    }
}