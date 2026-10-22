import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { FileEntity } from 'src/files/entities/file.entity';
import { ShareEntity } from 'src/sharing/entities/share.entity';
import { ReportSharesPaginatedQueryDto } from '../dto/request/report-shares-paginated-query.dto';
import { ReportSharesByUserQueryDto } from '../dto/request/report-shares-by-user-query.dto';
import { buildShareMatchStage, buildFileMatchStage } from '../utils/builder-share-match';
import { GranteeType } from 'src/common/constants/permissions/grantee-type';

/* Principal repository for share reports */
@Injectable()
export class ReportSharesRepository {
  constructor(
    @InjectModel(FileEntity.name) private readonly fileModel: Model<any>,
    @InjectModel(ShareEntity.name) private readonly shareModel: Model<any>,
  ) { }

  /* Method to list files with the most shares (paginated) */
  async mostSharedFilesPage(query: ReportSharesPaginatedQueryDto): Promise<{ content: any[]; total: number }> {
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;
    const shareMatch = buildShareMatchStage(query);

    shareMatch['resourceType'] = 'FILE';

    const pipeline: PipelineStage[] = [
      { $match: shareMatch },
      { $group: { _id: '$resourceId', shareCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'files',
          localField: '_id',
          foreignField: '_id',
          as: 'file',
        },
      },
      { $unwind: '$file' },
      { $match: { 'file.isDeleted': false } },
    ];

    if (query.search?.trim()) {
      pipeline.push({
        $match: { 'file.name': { $regex: query.search.trim(), $options: 'i' } },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'file.ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      } as PipelineStage,
      { $unwind: '$owner' } as PipelineStage,
      { $sort: { shareCount: sortDir } } as PipelineStage,
    );

    const [countResult, rows] = await Promise.all([
      this.shareModel.aggregate([...pipeline, { $count: 'total' }]),
      this.shareModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            fileId: { $toString: '$file._id' },
            fileName: '$file.name',
            extension: '$file.extension',
            ownerUsername: '$owner.username',
            ownerEmail: '$owner.email',
            shareCount: 1,
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }

  /* Method to list files shared by a specific user  */
  async sharedByUserPage(query: ReportSharesByUserQueryDto): Promise<{ content: any[]; total: number }> {
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;
    const shareMatch = buildShareMatchStage(query);

    shareMatch['ownerId'] = new Types.ObjectId(query.userId);

    const pipeline: PipelineStage[] = [
      { $match: shareMatch },
      ...this.buildResourceNameStages(query.search),
    ];

    if (query.search?.trim()) {
      pipeline.push(
        {
          $lookup: {
            from: 'files',
            let: { rid: '$resourceId', rt: '$resourceType' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$rid'] }, { $eq: ['$$rt', 'FILE'] }],
                  },
                },
              },
              { $project: { name: 1 } },
            ],
            as: 'fileDoc',
          },
        } as PipelineStage,
        {
          $lookup: {
            from: 'folders',
            let: { rid: '$resourceId', rt: '$resourceType' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$rid'] }, { $eq: ['$$rt', 'FOLDER'] }],
                  },
                },
              },
              { $project: { name: 1 } },
            ],
            as: 'folderDoc',
          },
        } as PipelineStage,
        {
          $addFields: {
            resourceName: {
              $ifNull: [
                { $arrayElemAt: ['$fileDoc.name', 0] },
                { $arrayElemAt: ['$folderDoc.name', 0] },
              ],
            },
          },
        } as PipelineStage,
        {
          $match: {
            resourceName: { $regex: query.search.trim(), $options: 'i' },
          },
        } as PipelineStage,
      );
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'granteeId',
          foreignField: '_id',
          as: 'grantee',
        },
      } as PipelineStage,
      { $sort: { createdAt: sortDir } } as PipelineStage,
    );

    const [countResult, rows] = await Promise.all([
      this.shareModel.aggregate([...pipeline, { $count: 'total' }]),
      this.shareModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            shareId: { $toString: '$_id' },
            resourceId: { $toString: '$resourceId' },
            resourceName: {
              $ifNull: ['$resourceName', 'Sin nombre'],
            },
            resourceType: 1,
            accessLevel: '$access',
            granteeType: 1,
            granteeUsername: { $arrayElemAt: ['$grantee.username', 0] },
            granteeEmail: { $arrayElemAt: ['$grantee.email', 0] },
            sharedAt: '$createdAt',
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }

  /* Method to list files received by a specific user (paginated) */
  async receivedByUserPage(query: ReportSharesByUserQueryDto): Promise<{ content: any[]; total: number }> {
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;
    const shareMatch = buildShareMatchStage(query);

    shareMatch['$or'] = [
      { granteeId: new Types.ObjectId(query.userId), granteeType: GranteeType.USER },
      { granteeType: GranteeType.ANY_USER },
    ];

    const pipeline: PipelineStage[] = [
      { $match: shareMatch },
      ...this.buildResourceNameStages(query.search),
    ];

    if (query.search?.trim()) {
      pipeline.push(
        {
          $lookup: {
            from: 'files',
            let: { rid: '$resourceId', rt: '$resourceType' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$rid'] }, { $eq: ['$$rt', 'FILE'] }],
                  },
                },
              },
              { $project: { name: 1 } },
            ],
            as: 'fileDoc',
          },
        } as PipelineStage,
        {
          $lookup: {
            from: 'folders',
            let: { rid: '$resourceId', rt: '$resourceType' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$rid'] }, { $eq: ['$$rt', 'FOLDER'] }],
                  },
                },
              },
              { $project: { name: 1 } },
            ],
            as: 'folderDoc',
          },
        } as PipelineStage,
        {
          $addFields: {
            resourceName: {
              $ifNull: [
                { $arrayElemAt: ['$fileDoc.name', 0] },
                { $arrayElemAt: ['$folderDoc.name', 0] },
              ],
            },
          },
        } as PipelineStage,
        {
          $match: {
            resourceName: { $regex: query.search.trim(), $options: 'i' },
          },
        } as PipelineStage,
      );
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      } as PipelineStage,
      { $unwind: '$owner' } as PipelineStage,
      { $sort: { createdAt: sortDir } } as PipelineStage,
    );

    const [countResult, rows] = await Promise.all([
      this.shareModel.aggregate([...pipeline, { $count: 'total' }]),
      this.shareModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            shareId: { $toString: '$_id' },
            resourceId: { $toString: '$resourceId' },
            resourceName: { $ifNull: ['$resourceName', 'Sin nombre'] },
            resourceType: 1,
            accessLevel: '$access',
            granteeType: 1,
            ownerUsername: '$owner.username',
            ownerEmail: '$owner.email',
            receivedAt: '$createdAt',
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }

  /* Method to list files that have never been shared (paginated) */
  async neverSharedFilesPage(query: ReportSharesPaginatedQueryDto): Promise<{ content: any[]; total: number }> {
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;
    const fileMatch = buildFileMatchStage(query);

    const sharedFileIds = await this.shareModel.distinct('resourceId', {
      resourceType: 'FILE',
    });
    fileMatch['_id'] = { $nin: sharedFileIds };

    const pipeline: PipelineStage[] = [
      { $match: fileMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      { $sort: { createdAt: sortDir } },
    ];

    const [countResult, rows] = await Promise.all([
      this.fileModel.aggregate([...pipeline, { $count: 'total' }]),
      this.fileModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            fileId: { $toString: '$_id' },
            fileName: '$name',
            extension: 1,
            sizeBytes: 1,
            ownerUsername: '$owner.username',
            ownerEmail: '$owner.email',
            createdAt: 1,
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }

  //Helper method filter builder
  private buildResourceNameStages(search?: string): PipelineStage[] {
    const stages: PipelineStage[] = [
      {
        $lookup: {
          from: 'files',
          let: { rid: '$resourceId', rt: '$resourceType' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$rid'] }, { $eq: ['$$rt', 'FILE'] }] } } },
            { $project: { name: 1 } },
          ],
          as: 'fileDoc',
        },
      },
      {
        $lookup: {
          from: 'folders',
          let: { rid: '$resourceId', rt: '$resourceType' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$rid'] }, { $eq: ['$$rt', 'FOLDER'] }] } } },
            { $project: { name: 1 } },
          ],
          as: 'folderDoc',
        },
      },
      {
        $addFields: {
          resourceName: {
            $ifNull: [
              { $arrayElemAt: ['$fileDoc.name', 0] },
              { $arrayElemAt: ['$folderDoc.name', 0] },
            ],
          },
        },
      },
    ];

    if (search?.trim()) {
      stages.push({ $match: { resourceName: { $regex: search.trim(), $options: 'i' } } });
    }

    return stages;
  }

}
