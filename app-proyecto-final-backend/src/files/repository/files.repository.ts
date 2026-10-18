import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, QueryFilter, Types } from 'mongoose';
import { FileDocument, FileEntity } from '../entities/file.entity';
import { PageRequest } from 'src/common/types/page-request';

export interface FileFilter {
  ownerId?: string | Types.ObjectId;
  folderId?: string | Types.ObjectId | null;
  extension?: 'txt' | 'md';
  isDeleted?: boolean;
  search?: string;
  from?: Date;
  to?: Date;
  minSize?: number;
  maxSize?: number;
}

@Injectable()
export class FilesRepository {
  constructor(
    @InjectModel(FileEntity.name) private readonly model: Model<FileEntity>,
  ) {}

  findById(id: string | Types.ObjectId, session?: ClientSession): Promise<FileDocument | null> {
    return this.model.findById(id).session(session || null).exec();
  }

  findActiveById(id: string | Types.ObjectId, session?: ClientSession): Promise<FileDocument | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .session(session || null)
      .exec();
  }

  findActiveByFolder(
    ownerId: string | Types.ObjectId,
    folderId: string | Types.ObjectId | null,
    session?: ClientSession,
  ): Promise<FileDocument[]> {
    return this.model
      .find({
        ownerId: new Types.ObjectId(ownerId),
        folderId: folderId ? new Types.ObjectId(folderId) : null,
        isDeleted: false,
      })
      .sort({ name: 1 })
      .session(session || null)
      .exec();
  }

  existsActiveSiblingByName(
    ownerId: string | Types.ObjectId,
    folderId: string | Types.ObjectId | null,
    name: string,
    excludeId?: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<boolean> {
    const filter: Record<string, any> = {
      ownerId: new Types.ObjectId(ownerId),
      folderId: folderId ? new Types.ObjectId(folderId) : null,
      name,
      isDeleted: false,
    };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    return this.model
      .exists(filter)
      .session(session || null)
      .then((res) => res !== null);
  }

  create(
    data: {
      ownerId: Types.ObjectId;
      folderId: Types.ObjectId | null;
      name: string;
      extension: 'txt' | 'md';
      mimeType: string;
      sizeBytes: number;
      gridFsId: Types.ObjectId;
    },
    session?: ClientSession,
  ): Promise<FileDocument> {
    const doc = new this.model(data);
    return doc.save({ session });
  }

  updateContent(
    id: string | Types.ObjectId,
    gridFsId: Types.ObjectId,
    sizeBytes: number,
    session?: ClientSession,
  ): Promise<FileDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { gridFsId, sizeBytes } },
        { new: true, session },
      )
      .exec();
  }

  rename(
    id: string | Types.ObjectId,
    name: string,
    extension: 'txt' | 'md',
    mimeType: string,
    session?: ClientSession,
  ): Promise<FileDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { name, extension, mimeType } },
        { new: true, session },
      )
      .exec();
  }

  move(
    id: string | Types.ObjectId,
    folderId: Types.ObjectId | null,
    session?: ClientSession,
  ): Promise<FileDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { folderId } },
        { new: true, session },
      )
      .exec();
  }

  async findPage(filter: FileFilter, page: PageRequest) {
    const mongoFilter = this.buildFilter(filter);
    const [content, total] = await Promise.all([
      this.model
        .find(mongoFilter)
        .sort({ [page.sortBy]: page.direction === 'asc' ? 1 : -1, _id: 1 })
        .skip(page.page * page.size)
        .limit(page.size)
        .exec(),
      this.model.countDocuments(mongoFilter).exec(),
    ]);

    return { content, total };
  }

  private buildFilter(f: FileFilter): QueryFilter<FileDocument> {
    const q: any = {};
    if (f.ownerId) q.ownerId = new Types.ObjectId(f.ownerId);
    if (f.folderId !== undefined) {
      q.folderId = f.folderId ? new Types.ObjectId(f.folderId) : null;
    }
    if (f.extension) q.extension = f.extension;
    if (f.isDeleted !== undefined) q.isDeleted = f.isDeleted;
    if (f.search) {
      q.name = { $regex: f.search, $options: 'i' };
    }
    if (f.minSize !== undefined || f.maxSize !== undefined) {
      q.sizeBytes = {};
      if (f.minSize !== undefined) q.sizeBytes.$gte = f.minSize;
      if (f.maxSize !== undefined) q.sizeBytes.$lte = f.maxSize;
    }
    if (f.from || f.to) {
      q.createdAt = {};
      if (f.from) q.createdAt.$gte = f.from;
      if (f.to) q.createdAt.$lte = f.to;
    }
    return q;
  }
}
