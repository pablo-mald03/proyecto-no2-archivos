import { Injectable } from "@nestjs/common";
import { PermissionDocument, PermissionEntity } from "../entities/permission.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QueryFilter, Types } from "mongoose";
import { PermissionFilter } from "../filter/permission-filter";
import { PageRequest } from "src/common/types/page-request";
import { escapeRegex } from "src/common/utils/escape-regex";

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

    //Method to find all permissions
    findAll(): Promise<PermissionDocument[]> {
        return this.model.find().sort({ module: 1, code: 1 }).exec();
    }

    //Method to find all permissions by codes
    findByCodes(codes: string[]): Promise<PermissionDocument[]> {
        return this.model.find({ code: { $in: codes } }).exec();
    }

    //Method to find permissions by filter
    async findPage(filter: PermissionFilter, page: PageRequest) {
        const mongoFilter = this.buildFilter(filter);
        const [content, total] = await Promise.all([
            this.model.find(mongoFilter)
                .sort({ [page.sortBy]: page.direction === 'asc' ? 1 : -1, _id: 1 })
                .skip(page.page * page.size).limit(page.size).exec(),
            this.model.countDocuments(mongoFilter).exec(),
        ]);
        return { content, total };
    }

    //Method to build filter
    private buildFilter(f: PermissionFilter): QueryFilter<PermissionEntity> {
        const q: QueryFilter<PermissionEntity> = {};
        if (f.module) q.module = f.module;
        if (f.search) {
            const rx = new RegExp(escapeRegex(f.search), 'i');
            q.$or = [{ code: rx }, { name: rx }];
        }
        return q;
    }
}