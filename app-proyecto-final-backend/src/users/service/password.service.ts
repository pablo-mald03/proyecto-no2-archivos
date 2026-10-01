import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

//Principal password encoder service (USES argon2)
@Injectable()
export class PasswordService {
    private readonly memoryCost: number;
    private readonly timeCost: number;
    private readonly parallelism: number;

    //Dependencies
    constructor(cfg: ConfigService) {
        this.memoryCost = cfg.getOrThrow<number>('ARGON2_MEMORY_KIB');
        this.timeCost = cfg.getOrThrow<number>('ARGON2_TIME_COST');
        this.parallelism = cfg.getOrThrow<number>('ARGON2_PARALLELISM');
    }

    //Principal hashing method
    hash(plain: string): Promise<string> {
        return argon2.hash(plain, {
            type: argon2.argon2id,
            memoryCost: this.memoryCost,
            timeCost: this.timeCost,
            parallelism: this.parallelism,
        });
    }

    //Principal comparation method for hash
    async compare(plain: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plain);
        } catch {
            return false;
        }
    }
}