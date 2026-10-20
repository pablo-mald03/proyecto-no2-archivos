import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { ShareDocument, ShareEntity } from '../entities/share.entity';
import { AccessLevel } from 'src/common/constants/permissions/access-level';
import { GranteeType } from 'src/common/constants/permissions/grantee-type';

//Principal shares repository class
@Injectable()
export class SharesRepository {
  constructor(
    @InjectModel(ShareEntity.name) private readonly model: Model<ShareEntity>,
  ) { }

  //Method to find share by id
  findById(id: string | Types.ObjectId, session?: ClientSession): Promise<ShareDocument | null> {
    return this.model.findById(id).session(session || null).exec();
  }

  //Method to find shares by resource
  findByResource(resourceType: 'FILE' | 'FOLDER', resourceId: string | Types.ObjectId, session?: ClientSession): Promise<ShareDocument[]> {
    return this.model
      .find({
        resourceType,
        resourceId: new Types.ObjectId(resourceId),
      })
      .session(session || null)
      .exec();
  }

  //Method to find effective shares for resource or ancestors
  findEffectiveSharesForResourceOrAncestors(items: { resourceType: 'FILE' | 'FOLDER'; resourceId: Types.ObjectId }[], granteeUserId: string | Types.ObjectId, session?: ClientSession): Promise<ShareDocument[]> {
    const userOid = new Types.ObjectId(granteeUserId);

    const resourceConditions = items.map((i) => ({
      resourceType: i.resourceType,
      resourceId: i.resourceId,
    }));

    return this.model
      .find({
        $or: resourceConditions,
        $and: [
          {
            $or: [
              { granteeType: GranteeType.ANY_USER },
              { granteeType: GranteeType.USER, granteeId: userOid },
            ],
          },
        ],
      })
      .session(session || null)
      .exec();
  }

  //Method to upsert the shared file or folder
  upsertShare(
    data: {
      resourceType: 'FILE' | 'FOLDER';
      resourceId: Types.ObjectId;
      ownerId: Types.ObjectId;
      granteeType: GranteeType;
      granteeId: Types.ObjectId | null;
      access: AccessLevel;
    },
    session?: ClientSession,
  ): Promise<ShareDocument> {
    const filter = {
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      granteeType: data.granteeType,
      granteeId: data.granteeId,
    };

    return this.model
      .findOneAndUpdate(
        filter,
        {
          $set: {
            ownerId: data.ownerId,
            access: data.access,
          },
        },
        { upsert: true, new: true, session },
      )
      .exec() as Promise<ShareDocument>;
  }

  //Method to delete a share by resource and grantee
  deleteByResourceAndGrantee(resourceType: 'FILE' | 'FOLDER', resourceId: string | Types.ObjectId, granteeType: GranteeType, granteeId: string | Types.ObjectId | null, session?: ClientSession): Promise<boolean> {
    return this.model
      .deleteOne({
        resourceType,
        resourceId: new Types.ObjectId(resourceId),
        granteeType,
        granteeId: granteeId ? new Types.ObjectId(granteeId) : null,
      })
      .session(session || null)
      .then((res) => res.deletedCount > 0);
  }

  //Method to delete a share by resource
  deleteByResource(resourceType: 'FILE' | 'FOLDER', resourceId: string | Types.ObjectId, session?: ClientSession): Promise<number> {
    return this.model
      .deleteMany({
        resourceType,
        resourceId: new Types.ObjectId(resourceId),
      })
      .session(session || null)
      .then((res) => res.deletedCount);
  }
}
