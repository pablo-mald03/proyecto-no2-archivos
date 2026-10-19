import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { FolderDocument, FolderEntity } from '../entities/folder.entity';

//Principal folders repository class
@Injectable()
export class FoldersRepository {
  constructor(
    @InjectModel(FolderEntity.name) private readonly model: Model<FolderEntity>,
  ) { }

  //Method to find a folder by id
  findById(id: string | Types.ObjectId, session?: ClientSession): Promise<FolderDocument | null> {
    return this.model.findById(id).session(session || null).exec();
  }

  //Method to find an active folder by id
  findActiveById(id: string | Types.ObjectId, session?: ClientSession): Promise<FolderDocument | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .session(session || null)
      .exec();
  }

  //Method to find active folders by ids
  findByIds(ids: (string | Types.ObjectId)[], session?: ClientSession): Promise<FolderDocument[]> {
    return this.model
      .find({ _id: { $in: ids }, isDeleted: false })
      .session(session || null)
      .exec();
  }

  //Method to find active children of a folder
  findActiveChildren(ownerId: string | Types.ObjectId, parentId: string | Types.ObjectId | null, session?: ClientSession): Promise<FolderDocument[]> {
    return this.model
      .find({
        ownerId: new Types.ObjectId(ownerId),
        parentId: parentId ? new Types.ObjectId(parentId) : null,
        isDeleted: false,
      })
      .sort({ name: 1 })
      .session(session || null)
      .exec();
  }

  //Method to check if there is an active sibling folder by name
  existsActiveSiblingByName(ownerId: string | Types.ObjectId, parentId: string | Types.ObjectId | null, name: string, excludeId?: string | Types.ObjectId, session?: ClientSession): Promise<boolean> {

    const filter: Record<string, any> = {
      ownerId: new Types.ObjectId(ownerId),
      parentId: parentId ? new Types.ObjectId(parentId) : null,
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

  //Method to create a new folder
  create(data: {
    ownerId: Types.ObjectId;
    parentId: Types.ObjectId | null;
    name: string;
    ancestors: Types.ObjectId[];
  },
    session?: ClientSession,
  ): Promise<FolderDocument> {
    const doc = new this.model(data);
    return doc.save({ session });
  }

  //Method to rename a folder
  rename(id: string | Types.ObjectId, name: string, session?: ClientSession): Promise<FolderDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { name } },
        { new: true, session },
      )
      .exec();
  }

  //Method to update a folder's parent and ancestors
  updateFolderParentAndAncestors(id: Types.ObjectId, parentId: Types.ObjectId | null, ancestors: Types.ObjectId[], session?: ClientSession): Promise<FolderDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { parentId, ancestors } },
        { new: true, session },
      )
      .exec();
  }

  //Method to find descendant folders
  findDescendants(folderId: Types.ObjectId, session?: ClientSession): Promise<FolderDocument[]> {
    return this.model
      .find({ ancestors: folderId, isDeleted: false })
      .session(session || null)
      .exec();
  }

  /*Principal method to rewrite the ancestors of descendant folders*/
  async rewriteDescendantsAncestors(descendants: FolderDocument[], oldAncestorChainLength: number, newAncestorPrefix: Types.ObjectId[], session?: ClientSession,): Promise<void> {
    const bulkOps = descendants.map((descendant) => {
      const relativeAncestors = descendant.ancestors.slice(oldAncestorChainLength);
      const updatedAncestors = [...newAncestorPrefix, ...relativeAncestors];

      return {
        updateOne: {
          filter: { _id: descendant._id },
          update: { $set: { ancestors: updatedAncestors } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await this.model.bulkWrite(bulkOps as any, { session });
    }
  }

  //Method to mark a folder and its subfolders as deleted with a trashBatchId
  async moveToTrash(folderId: Types.ObjectId, descendantFolderIds: Types.ObjectId[], trashBatchId: Types.ObjectId, deletedBy: Types.ObjectId, session?: ClientSession): Promise<void> {
    const now = new Date();
    await this.model.updateOne(
      { _id: folderId },
      {
        $set: {
          isDeleted: true,
          deletedAt: now,
          deletedBy,
          trashBatchId,
          isTrashRoot: true,
        },
      },
      { session },
    );

    if (descendantFolderIds.length > 0) {
      await this.model.updateMany(
        { _id: { $in: descendantFolderIds } },
        {
          $set: {
            isDeleted: true,
            deletedAt: now,
            deletedBy,
            trashBatchId,
            isTrashRoot: false,
          },
        },
        { session },
      );
    }
  }

  //Method to find trash root folders for owner
  findTrashRoots(ownerId: string | Types.ObjectId): Promise<FolderDocument[]> {
    return this.model
      .find({
        ownerId: new Types.ObjectId(ownerId),
        isDeleted: true,
        isTrashRoot: true,
      })
      .sort({ deletedAt: -1 })
      .exec();
  }

  //Method to find all folders in a trash batch
  findByTrashBatch(trashBatchId: Types.ObjectId, session?: ClientSession): Promise<FolderDocument[]> {
    return this.model.find({ trashBatchId }).session(session || null).exec();
  }

  //Method to restore folders by trash batch id
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

  /*Delete permanently folders belonging to a trash batch*/
  async deletePermanentlyByBatch(trashBatchId: Types.ObjectId, session?: ClientSession): Promise<number> {
    const res = await this.model.deleteMany({ trashBatchId }, { session });
    return res.deletedCount;
  }
}
