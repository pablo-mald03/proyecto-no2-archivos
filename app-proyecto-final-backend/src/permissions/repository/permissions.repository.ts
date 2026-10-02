import { Injectable } from "@nestjs/common";
import { PermissionDocument, PermissionEntity } from "../entities/permission.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

//Principal permission repository persistency layer
@Injectable()
export class PermissionsRepository {
    constructor(@InjectModel(PermissionEntity.name) private readonly model: Model<PermissionEntity>) { }

    //Method  to find by id any permission
    findById(id: Types.ObjectId | string): Promise<PermissionDocument | null> {
        return this.model.findById(id).exec();
    }

    //Method to find permission by code (alias) 
    findByCode(code: string): Promise<PermissionDocument | null> {
        return this.model.findOne({ code }).exec();
    }
}