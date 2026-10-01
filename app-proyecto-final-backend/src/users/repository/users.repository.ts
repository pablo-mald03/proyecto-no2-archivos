
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity, UserDocument } from '../entities/user.entity';

/*Principal users respository for the persinstence layer */
@Injectable()
export class UsersRepository {
    constructor(@InjectModel(UserEntity.name) private readonly model: Model<UserEntity>) { }

    findById(id: string): Promise<UserDocument | null> {
        return this.model.findById(id).exec();
    }

    //Principal auth method 
    findByEmailWithPassword(email: string): Promise<UserDocument | null> {
        return this.model.findOne({ email }).select('+passwordHash').exec();
    }
}