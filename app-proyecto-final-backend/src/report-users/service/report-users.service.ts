import { Injectable } from '@nestjs/common';
import { ReportUsersRepository } from '../repository/report-users.repository';
import { ReportUsersFilterDto } from '../dto/request/report-users-filter.dto';
import { ReportUsersPaginatedQueryDto } from '../dto/request/report-users-paginated-query.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import {
  TopUserByFileCountDto,
  TopUserByStorageDto,
  UserStoragePercentageDto,
  UserShareCountDto,
} from '../dto/response/report-users-response.dto';

/* Principal service for user reports */
@Injectable()
export class ReportUsersService {
  constructor(private readonly repo: ReportUsersRepository) { }

  /* Top 10 users with the most files stored */
  async topByFileCount(filter: ReportUsersFilterDto): Promise<TopUserByFileCountDto[]> {
    return this.repo.topByFileCount(filter);
  }

  /* Top 10 users with the most storage used */
  async topByStorageUsed(filter: ReportUsersFilterDto): Promise<TopUserByStorageDto[]> {
    return this.repo.topByStorageUsed(filter);
  }

  /* Storage percentage per user */
  async storagePercentagePage(
    query: ReportUsersPaginatedQueryDto,
  ): Promise<PageResponseDto<UserStoragePercentageDto>> {
    const { content, total } = await this.repo.storagePercentagePage(query);
    return PageResponseDto.of(content, total, query);
  }

  /* Users with the most shared resources */
  async shareCountPage(
    query: ReportUsersPaginatedQueryDto,
  ): Promise<PageResponseDto<UserShareCountDto>> {
    const { content, total } = await this.repo.shareCountPage(query);
    return PageResponseDto.of(content, total, query);
  }
}
