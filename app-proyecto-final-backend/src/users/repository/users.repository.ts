
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { UserEntity, UserDocument } from '../entities/user.entity';
import { UserFilter } from '../types/user-filter';
import { PageRequest } from 'src/common/types/page-request';
import { UserProfilePatch } from '../types/user-profile-patch';
import { escapeRegex } from 'src/common/utils/escape-regex';

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

    async findPage(filter: UserFilter, page: PageRequest) {
        const mongoFilter = this.buildFilter(filter);
        const [content, total] = await Promise.all([
            this.model.find(mongoFilter)
                .sort({ [page.sortBy]: page.direction === 'asc' ? 1 : -1, _id: 1 }) // _id keeps pages stable
                .skip(page.page * page.size).limit(page.size).exec(),
            this.model.countDocuments(mongoFilter).exec(),
        ]);
        return { content, total };
    }

    findByIdWithPassword(id: string): Promise<UserDocument | null> {
        return this.model.findById(id).select('+passwordHash').exec();
    }

    existsByEmail(email: string, excludeId?: string): Promise<boolean> {
        return this.exists({ email }, excludeId);
    }
    existsByUsername(username: string, excludeId?: string): Promise<boolean> {
        return this.exists({ username }, excludeId);
    }

    updateProfile(id: string, data: UserProfilePatch): Promise<UserDocument | null> {
        const patch = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
        return this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    }

    setActive(id: string, isActive: boolean): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(
            id, { $set: { isActive, deactivatedAt: isActive ? null : new Date() } }, { new: true }).exec();
    }

    setRole(id: string, roleId: Types.ObjectId): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(id, { $set: { roleId } }, { new: true }).exec();
    }

    setQuota(id: string, quotaBytes: number): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(id, { $set: { 'storage.quotaBytes': quotaBytes } }, { new: true }).exec();
    }

    async setPasswordHash(id: string, passwordHash: string): Promise<void> {
        await this.model.updateOne({ _id: id }, { $set: { passwordHash } }).exec();
    }

    countActiveByRoleId(roleId: Types.ObjectId): Promise<number> {
        return this.model.countDocuments({ roleId, isActive: true }).exec();
    }

    private async exists(match: Record<string, string>, excludeId?: string): Promise<boolean> {
        const filter = excludeId ? { ...match, _id: { $ne: excludeId } } : match;
        return (await this.model.exists(filter)) !== null;
    }

    private buildFilter(f: UserFilter): QueryFilter<UserDocument> {
        const q: QueryFilter<UserDocument> = {};
        if (f.isActive !== undefined) q.isActive = f.isActive;
        if (f.roleId) q.roleId = f.roleId;
        if (f.search) {
            const rx = new RegExp(escapeRegex(f.search), 'i');
            q.$or = [{ username: rx }, { email: rx }, { firstName: rx }, { lastName: rx }];
        }
        return q;
    }
}