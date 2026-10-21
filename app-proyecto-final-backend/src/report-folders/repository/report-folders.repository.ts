import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { FolderEntity } from 'src/folders/entities/folder.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { ReportFoldersPaginatedQueryDto } from '../dto/request/report-folders-paginated-query.dto';
import { ReportFoldersByUserQueryDto } from '../dto/request/report-folders-by-user-query.dto';
import { ReportFoldersByFolderQueryDto } from '../dto/request/report-folders-by-folder-query.dto';
import { buildFolderMatchStage } from '../utils/builder-folder-match';

/* Principal repository for folder reports */
@Injectable()
export class ReportFoldersRepository {
  constructor(
    @InjectModel(FolderEntity.name) private readonly folderModel: Model<any>,
    @InjectModel(FileEntity.name) private readonly fileModel: Model<any>,
  ) { }

  /* Method to list folders with the most files (paginated) */
  async foldersWithMostFilesPage(query: ReportFoldersPaginatedQueryDto,): Promise<{ content: any[]; total: number }> {
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;
    const folderMatch = buildFolderMatchStage(query);

    const pipeline: PipelineStage[] = [
      { $match: folderMatch },
      {
        $lookup: {
          from: 'files',
          let: { folderId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$folderId', '$$folderId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'fileStats',
        },
      },
      {
        $addFields: {
          fileCount: { $ifNull: [{ $arrayElemAt: ['$fileStats.count', 0] }, 0] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      { $sort: { fileCount: sortDir, name: 1 } },
    ];

    const [countResult, rows] = await Promise.all([
      this.folderModel.aggregate([...pipeline, { $count: 'total' }]),
      this.folderModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            folderId: { $toString: '$_id' },
            folderName: '$name',
            ownerUsername: '$owner.username',
            ownerEmail: '$owner.email',
            fileCount: 1,
            createdAt: 1,
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }

  /* Method to list space used by root folders of a user (paginated) */
  async userRootFoldersSpacePage(query: ReportFoldersByUserQueryDto,): Promise<{ content: any[]; total: number }> {
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;
    const folderMatch = buildFolderMatchStage(query);

    folderMatch['ownerId'] = new Types.ObjectId(query.userId);
    folderMatch['parentId'] = null;

    const pipeline: PipelineStage[] = [
      { $match: folderMatch },
      {
        $lookup: {
          from: 'folders',
          let: { rootId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$$rootId', '$ancestors'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: 'descendantFolders',
        },
      },
      {
        $addFields: {
          allFolderIds: {
            $concatArrays: [['$_id'], '$descendantFolders._id'],
          },
        },
      },
      {
        $lookup: {
          from: 'files',
          let: { fids: '$allFolderIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$folderId', '$$fids'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalSizeBytes: { $sum: '$sizeBytes' },
                fileCount: { $sum: 1 },
              },
            },
          ],
          as: 'fileStats',
        },
      },
      {
        $addFields: {
          totalSizeBytes: { $ifNull: [{ $arrayElemAt: ['$fileStats.totalSizeBytes', 0] }, 0] },
          fileCount: { $ifNull: [{ $arrayElemAt: ['$fileStats.fileCount', 0] }, 0] },
        },
      },
      { $sort: { totalSizeBytes: sortDir, name: 1 } },
    ];

    const [countResult, rows] = await Promise.all([
      this.folderModel.aggregate([...pipeline, { $count: 'total' }]),
      this.folderModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            folderId: { $toString: '$_id' },
            folderName: '$name',
            totalSizeBytes: 1,
            fileCount: 1,
            createdAt: 1,
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }

  /* Method to list contents of a folder and its subfolders (paginated) */
  async folderContentsPage(query: ReportFoldersByFolderQueryDto,): Promise<{ content: any[]; total: number }> {
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;
    const targetId = new Types.ObjectId(query.folderId);

    const descendantFolders = await this.folderModel
      .find({ ancestors: targetId, isDeleted: false }, { _id: 1 })
      .lean();

    const allFolderIds = [targetId, ...descendantFolders.map((d: any) => d._id)];

    const folderMatch: Record<string, any> = {
      ancestors: targetId,
      isDeleted: false,
    };
    const fileMatch: Record<string, any> = {
      folderId: { $in: allFolderIds },
      isDeleted: false,
    };

    if (query.search?.trim()) {
      const searchRegex = { $regex: query.search.trim(), $options: 'i' };
      folderMatch['name'] = searchRegex;
      fileMatch['name'] = searchRegex;
    }

    if (query.dateFrom || query.dateTo) {
      const dateCond: Record<string, any> = {};
      if (query.dateFrom) dateCond['$gte'] = new Date(query.dateFrom);
      if (query.dateTo) dateCond['$lte'] = new Date(query.dateTo);
      folderMatch['createdAt'] = dateCond;
      fileMatch['createdAt'] = dateCond;
    }

    const pipeline: PipelineStage[] = [
      { $match: folderMatch },
      {
        $project: {
          _id: 1,
          resourceName: '$name',
          resourceType: { $literal: 'FOLDER' },
          extension: { $literal: null },
          sizeBytes: { $literal: 0 },
          parentFolderId: { $toString: '$parentId' },
          createdAt: 1,
        },
      },
      {
        $unionWith: {
          coll: 'files',
          pipeline: [
            { $match: fileMatch },
            {
              $project: {
                _id: 1,
                resourceName: '$name',
                resourceType: { $literal: 'FILE' },
                extension: '$extension',
                sizeBytes: '$sizeBytes',
                parentFolderId: { $toString: '$folderId' },
                createdAt: 1,
              },
            },
          ],
        },
      },
      { $sort: { createdAt: sortDir } },
    ];

    const [countResult, rows] = await Promise.all([
      this.folderModel.aggregate([...pipeline, { $count: 'total' }]),
      this.folderModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            resourceId: { $toString: '$_id' },
            resourceName: 1,
            resourceType: 1,
            extension: 1,
            sizeBytes: 1,
            parentFolderId: 1,
            createdAt: 1,
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }
}
