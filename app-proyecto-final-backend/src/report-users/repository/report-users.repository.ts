import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { UserEntity, UserDocument } from 'src/users/entities/user.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { ShareEntity } from 'src/sharing/entities/share.entity';
import { ReportUsersFilterDto } from '../dto/request/report-users-filter.dto';
import { ReportUsersPaginatedQueryDto } from '../dto/request/report-users-paginated-query.dto';
import { GranteeType } from 'src/common/constants/permissions/grantee-type';
import { buildUserMatchStage } from '../utils/builder-user-match';


/* Principal repository for user reports */
@Injectable()
export class ReportUsersRepository {
  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(FileEntity.name) private readonly fileModel: Model<any>,
    @InjectModel(ShareEntity.name) private readonly shareModel: Model<any>,
  ) { }

  /* Method to calculate top 10 users with the most files */
  async topByFileCount(filter: ReportUsersFilterDto): Promise<any[]> {
    const userMatch = buildUserMatchStage(filter);

    return this.userModel.aggregate([
      { $match: userMatch },
      {
        $lookup: {
          from: 'files',
          let: { uid: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$ownerId', '$$uid'] }, { $eq: ['$isDeleted', false] }] } } },
            { $count: 'total' },
          ],
          as: 'fileStat',
        },
      },
      {
        $addFields: {
          fileCount: { $ifNull: [{ $arrayElemAt: ['$fileStat.total', 0] }, 0] },
        },
      },
      { $sort: { fileCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          username: 1,
          email: 1,
          fullName: { $concat: ['$firstName', ' ', '$lastName'] },
          fileCount: 1,
        },
      },
    ]);
  }

  /* Method to calculate top 10 users with the most storage used */
  async topByStorageUsed(filter: ReportUsersFilterDto): Promise<any[]> {
    const userMatch = buildUserMatchStage(filter);

    return this.userModel.aggregate([
      { $match: userMatch },
      { $sort: { 'storage.usedBytes': -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          username: 1,
          email: 1,
          fullName: { $concat: ['$firstName', ' ', '$lastName'] },
          usedBytes: '$storage.usedBytes',
          quotaBytes: '$storage.quotaBytes',
        },
      },
    ]);
  }

  /* Method to calculate storage percentage per user */
  async storagePercentagePage(
    query: ReportUsersPaginatedQueryDto,
  ): Promise<{ content: any[]; total: number }> {
    const userMatch = buildUserMatchStage(query);
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: userMatch },
      {
        $addFields: {
          percentageUsed: {
            $cond: [
              { $gt: ['$storage.quotaBytes', 0] },
              {
                $multiply: [
                  { $divide: ['$storage.usedBytes', '$storage.quotaBytes'] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { percentageUsed: sortDir } },
    ];

    const [countResult, rows] = await Promise.all([
      this.userModel.aggregate([...pipeline, { $count: 'total' }]),
      this.userModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            userId: { $toString: '$_id' },
            username: 1,
            email: 1,
            fullName: { $concat: ['$firstName', ' ', '$lastName'] },
            usedBytes: '$storage.usedBytes',
            quotaBytes: '$storage.quotaBytes',
            percentageUsed: 1,
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }

  /* Method to calculate share count per user */
  async shareCountPage(
    query: ReportUsersPaginatedQueryDto,
  ): Promise<{ content: any[]; total: number }> {
    const userMatch = buildUserMatchStage(query);
    const skip = query.page * query.size;
    const sortDir = query.direction === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          granteeType: GranteeType.USER,
        },
      },
      { $group: { _id: '$ownerId', shareCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.isActive': true } },
    ];

    if (userMatch['$or']) {
      const orConditions = (userMatch['$or'] as any[]).map((cond) => {
        const mapped: Record<string, any> = {};
        Object.entries(cond).forEach(([k, v]) => { mapped[`user.${k}`] = v; });
        return mapped;
      });
      pipeline.push({ $match: { $or: orConditions } });
    }
    if (userMatch['createdAt']) {
      pipeline.push({ $match: { 'user.createdAt': userMatch['createdAt'] } });
    }

    pipeline.push({ $sort: { shareCount: sortDir } });

    const [countResult, rows] = await Promise.all([
      this.shareModel.aggregate([...pipeline, { $count: 'total' }]),
      this.shareModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: query.size },
        {
          $project: {
            _id: 0,
            userId: { $toString: '$user._id' },
            username: '$user.username',
            email: '$user.email',
            fullName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
            shareCount: 1,
          },
        },
      ]),
    ]);

    return { content: rows, total: countResult[0]?.total ?? 0 };
  }
}
