import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, QueryFilter, Types } from 'mongoose';
import { FileDocument, FileEntity } from '../entities/file.entity';
import { PageRequest } from 'src/common/types/page-request';
import { FileFilter } from '../filter/file.filter';


/*Principal file repository class*/
@Injectable()
export class FilesRepository {
  constructor(
    @InjectModel(FileEntity.name) private readonly model: Model<FileEntity>,
  ) { }

  //Method to find a file by ID
  findById(id: string | Types.ObjectId, session?: ClientSession): Promise<FileDocument | null> {
    return this.model.findById(id).session(session || null).exec();
  }

  //Method to find an active file by ID
  findActiveById(id: string | Types.ObjectId, session?: ClientSession): Promise<FileDocument | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .session(session || null)
      .exec();
  }

  //Method to find active files by IDs
  findByIds(ids: (string | Types.ObjectId)[], session?: ClientSession): Promise<FileDocument[]> {
    return this.model
      .find({ _id: { $in: ids }, isDeleted: false })
      .session(session || null)
      .exec();
  }

  //Method to find active files in a folder
  findActiveByFolder(ownerId: string | Types.ObjectId, folderId: string | Types.ObjectId | null, session?: ClientSession): Promise<FileDocument[]> {
    return this.model.find({
      ownerId: new Types.ObjectId(ownerId),
      folderId: folderId ? new Types.ObjectId(folderId) : null,
      isDeleted: false,
    })
      .sort({ name: 1 })
      .session(session || null)
      .exec();
  }

  //Method to find recent active files for owner
  findRecent(ownerId: string | Types.ObjectId, limit = 20, session?: ClientSession): Promise<FileDocument[]> {
    return this.model
      .find({
        ownerId: new Types.ObjectId(ownerId),
        isDeleted: false,
      })
      .sort({ updatedAt: -1, _id: -1 })
      .limit(limit)
      .session(session || null)
      .exec();
  }

  //Method to check if a file with the same name exists in the same folder
  existsActiveSiblingByName(ownerId: string | Types.ObjectId, folderId: string | Types.ObjectId | null, name: string, excludeId?: string | Types.ObjectId, session?: ClientSession,
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

  //Method to create a file
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

  //Method to update a file
  updateContent(id: string | Types.ObjectId, gridFsId: Types.ObjectId, sizeBytes: number, session?: ClientSession): Promise<FileDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { gridFsId, sizeBytes } },
        { new: true, session },
      )
      .exec();
  }

  //Method to rename a file
  rename(id: string | Types.ObjectId, name: string, extension: 'txt' | 'md', mimeType: string, session?: ClientSession): Promise<FileDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { name, extension, mimeType } },
        { new: true, session },
      )
      .exec();
  }

  //Method to move a file
  move(id: string | Types.ObjectId, folderId: Types.ObjectId | null, session?: ClientSession): Promise<FileDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { folderId } },
        { new: true, session },
      )
      .exec();
  }

  //Method to find a page of files
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

  //Principal build filter helper method
  private buildFilter(filter: FileFilter): QueryFilter<FileDocument> {
    const q: any = {};
    if (filter.ownerId) q.ownerId = new Types.ObjectId(filter.ownerId);
    if (filter.folderId !== undefined) {
      q.folderId = filter.folderId ? new Types.ObjectId(filter.folderId) : null;
    }
    if (filter.extension) q.extension = filter.extension;
    if (filter.isDeleted !== undefined) q.isDeleted = filter.isDeleted;
    if (filter.search) {
      q.name = { $regex: filter.search, $options: 'i' };
    }
    if (filter.minSize !== undefined || filter.maxSize !== undefined) {
      q.sizeBytes = {};
      if (filter.minSize !== undefined) q.sizeBytes.$gte = filter.minSize;
      if (filter.maxSize !== undefined) q.sizeBytes.$lte = filter.maxSize;
    }
    if (filter.from || filter.to) {
      const field = filter.dateField || 'createdAt';
      q[field] = {};
      if (filter.from) q[field].$gte = filter.from;
      if (filter.to) q[field].$lte = filter.to;
    }
    return q;
  }

  //Method to move a file to trash
  async moveToTrash(fileId: Types.ObjectId, trashBatchId: Types.ObjectId, deletedBy: Types.ObjectId, session?: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: fileId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
          trashBatchId,
          isTrashRoot: true,
        },
      },
      { session },
    );
  }

  //Method to move all files inside a set of folders to trash (cascade inside folder trash batch)
  async moveByFolderIdsToTrash(folderIds: Types.ObjectId[], trashBatchId: Types.ObjectId, deletedBy: Types.ObjectId, session?: ClientSession): Promise<void> {
    await this.model.updateMany(
      { folderId: { $in: folderIds } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
          trashBatchId,
          isTrashRoot: false,
        },
      },
      { session },
    );
  }

  //Method to find trash root files for owner
  findTrashRoots(ownerId: string | Types.ObjectId): Promise<FileDocument[]> {
    return this.model
      .find({
        ownerId: new Types.ObjectId(ownerId),
        isDeleted: true,
        isTrashRoot: true,
      })
      .sort({ deletedAt: -1 })
      .exec();
  }

  //Method to find files belonging to a trash batch
  findByTrashBatch(trashBatchId: Types.ObjectId, session?: ClientSession): Promise<FileDocument[]> {
    return this.model.find({ trashBatchId }).session(session || null).exec();
  }

  //Method to restore files by trash batch
  async restoreByTrashBatch(trashBatchId: Types.ObjectId, session?: ClientSession): Promise<void> {
    await this.model.updateMany(
      { trashBatchId },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          trashBatchId: null,
          isTrashRoot: false,
        },
      },
      { session },
    );
  }

  //Method to permanently delete files by trash batch
  async deletePermanentlyByBatch(trashBatchId: Types.ObjectId, session?: ClientSession): Promise<number> {
    const res = await this.model.deleteMany({ trashBatchId }, { session });
    return res.deletedCount;
  }

  //Method to find all deleted files for owner
  findAllDeletedByOwner(ownerId: string | Types.ObjectId, session?: ClientSession): Promise<FileDocument[]> {
    return this.model
      .find({
        ownerId: new Types.ObjectId(ownerId),
        isDeleted: true,
      })
      .session(session || null)
      .exec();
  }

  //Method to permanently delete all trashed files for owner
  async deleteAllPermanentlyByOwner(ownerId: string | Types.ObjectId, session?: ClientSession): Promise<number> {
    const res = await this.model.deleteMany(
      {
        ownerId: new Types.ObjectId(ownerId),
        isDeleted: true,
      },
      { session },
    );
    return res.deletedCount;
  }
}
