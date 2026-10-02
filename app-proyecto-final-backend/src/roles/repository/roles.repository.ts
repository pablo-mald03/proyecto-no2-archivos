import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleDocument, RoleEntity } from 'src/roles/entities/role.entity';

//Principal role repository persistency layer
@Injectable()
export class RolesRepository {
    constructor(@InjectModel(RoleEntity.name) private readonly model: Model<RoleEntity>) { }

    //Method  to find by id any role
    findById(id: Types.ObjectId | string): Promise<RoleDocument | null> {
        return this.model.findById(id).exec();
    }

    //Method to find role by code (alias) 
    findByCode(code: string): Promise<RoleDocument | null> {
        return this.model.findOne({ code }).exec();
    }
}