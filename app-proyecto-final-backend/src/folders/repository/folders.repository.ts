import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { FolderDocument, FolderEntity } from '../entities/folder.entity';

/*Principal folders repository class*/
@Injectable()
export class FoldersRepository {
  constructor(
    @InjectModel(FolderEntity.name) private readonly model: Model<FolderEntity>,
  ) { }

  /*Principal method to find a folder by  id*/
  findById(id: string | Types.ObjectId, session?: ClientSession): Promise<FolderDocument | null> {
    return this.model.findById(id).session(session || null).exec();
  }

  /*Principal method to find an active folder by id*/
  findActiveById(id: string | Types.ObjectId, session?: ClientSession): Promise<FolderDocument | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .session(session || null)
      .exec();
  }

  /*Principal method to find active folders by ids*/
  findByIds(ids: (string | Types.ObjectId)[], session?: ClientSession): Promise<FolderDocument[]> {
    return this.model
      .find({ _id: { $in: ids }, isDeleted: false })
      .session(session || null)
      .exec();
  }

  /*Principal method to find active children of a folder*/
  findActiveChildren(ownerId: string | Types.ObjectId,
    parentId: string | Types.ObjectId | null,
    session?: ClientSession): Promise<FolderDocument[]> {
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

  /*Principal method to check if there is an active sibling folder by name*/
  existsActiveSiblingByName(ownerId: string | Types.ObjectId,
    parentId: string | Types.ObjectId | null,
    name: string,
    excludeId?: string | Types.ObjectId,
    session?: ClientSession): Promise<boolean> {


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

  /*Principal method to create a new folder*/
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

  /*Principal method to rename a folder*/
  rename(id: string | Types.ObjectId,
    name: string,
    session?: ClientSession): Promise<FolderDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { name } },
        { new: true, session },
      )
      .exec();
  }

  /*Principal method to update a folder's parent and ancestors*/
  updateFolderParentAndAncestors(id: Types.ObjectId,
    parentId: Types.ObjectId | null,
    ancestors: Types.ObjectId[],
    session?: ClientSession,
  ): Promise<FolderDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { parentId, ancestors } },
        { new: true, session },
      )
      .exec();
  }

  /*Principal method to find descendant folders*/
  findDescendants(folderId: Types.ObjectId,
    session?: ClientSession): Promise<FolderDocument[]> {
    return this.model
      .find({ ancestors: folderId, isDeleted: false })
      .session(session || null)
      .exec();
  }

  /*Principal method to rewrite the ancestors of descendant folders*/
  async rewriteDescendantsAncestors(descendants: FolderDocument[],
    oldAncestorChainLength: number,
    newAncestorPrefix: Types.ObjectId[],
    session?: ClientSession,
  ): Promise<void> {
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
}
