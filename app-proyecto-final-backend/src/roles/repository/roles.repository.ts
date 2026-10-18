import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { RoleDocument, RoleEntity } from 'src/roles/entities/role.entity';
import { RoleFilter } from '../filter/role-filter';
import { escapeRegex } from 'src/common/utils/escape-regex';
import { RoleInfoPatch } from '../models/role-info-patch.model';
import { PageRequest } from 'src/common/types/page-request';

//Principal role repository persistency layer
@Injectable()
export class RolesRepository {
    constructor(@InjectModel(RoleEntity.name) private readonly model: Model<RoleEntity>) { }

    //Method to create a new role
    create(data: Pick<RoleEntity, 'code' | 'name' | 'description' | 'permissions'>): Promise<RoleDocument> {
        return this.model.create(data);
    }

    //Method to verify if the role already exists
    async existsByCode(code: string): Promise<boolean> {
        return (await this.model.exists({ code })) !== null;
    }

    //Method to get all roles pageable
    async findPage(filter: RoleFilter, page: PageRequest) {
        const mongoFilter = this.buildFilter(filter);
        const [content, total] = await Promise.all([
            this.model.find(mongoFilter)
                .sort({ [page.sortBy]: page.direction === 'asc' ? 1 : -1, _id: 1 })
                .skip(page.page * page.size).limit(page.size).exec(),
            this.model.countDocuments(mongoFilter).exec(),
        ]);
        return { content, total };
    }

    //Method to update the role information
    updateInfo(id: string, data: RoleInfoPatch): Promise<RoleDocument | null> {
        const patch = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
        return this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    }

    //Method to set the role permissions
    setPermissions(id: string, permissions: string[]): Promise<RoleDocument | null> {
        return this.model.findByIdAndUpdate(id, { $set: { permissions } }, { new: true }).exec();
    }

    //Method to set the role status
    setActive(id: string, isActive: boolean): Promise<RoleDocument | null> {
        return this.model.findByIdAndUpdate(
            id, { $set: { isActive, deactivatedAt: isActive ? null : new Date() } }, { new: true }).exec();
    }

    //Method  to find by id any role
    findById(id: Types.ObjectId | string): Promise<RoleDocument | null> {
        return this.model.findById(id).exec();
    }

    //Method to find the roles by ids
    findByIds(ids: string[]): Promise<RoleDocument[]> {
        return this.model.find({ _id: { $in: ids } }).exec();
    }

    //Method to find role by code (alias) 
    findByCode(code: string): Promise<RoleDocument | null> {
        return this.model.findOne({ code }).exec();
    }

    //Filter builder for roles
    private buildFilter(f: RoleFilter): QueryFilter<RoleEntity> {
        const q: QueryFilter<RoleEntity> = {};
        if (f.isActive !== undefined) q.isActive = f.isActive;
        if (f.search) {
            const rx = new RegExp(escapeRegex(f.search), 'i');
            q.$or = [{ code: rx }, { name: rx }];
        }
        return q;
    }
}