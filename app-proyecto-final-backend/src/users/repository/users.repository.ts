
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity, UserDocument } from '../entities/user.entity';

/*Principal users respository for the persinstence layer */
@Injectable()
export class UsersRepository {
    constructor(@InjectModel(UserEntity.name) private readonly model: Model<UserEntity>) { }

    //Principal method to find user by id
    findById(id: string): Promise<UserDocument | null> {
        return this.model.findById(id).exec();
    }

    //Principal auth method 
    findByEmailWithPassword(email: string): Promise<UserDocument | null> {
        return this.model.findOne({ email }).select('+passwordHash').exec();
    }

    //Principal method to touch last login
    touchLastLogin(id: string) {
        return this.model.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } }).exec();
    }

    // Persists a new user (timestamps are set by Mongoose)
    create(data: Pick<UserEntity,
        'username' | 'email' | 'passwordHash' | 'firstName' | 'lastName' | 'roleId' | 'storage'>,): Promise<UserDocument> {
        return this.model.create(data);
    }

    async existsByEmailOrUsername(email: string, username: string): Promise<boolean> {
        const found = await this.model.exists({ $or: [{ email }, { username }] });
        return found !== null;
    }
}