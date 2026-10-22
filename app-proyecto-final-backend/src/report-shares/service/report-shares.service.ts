import { Injectable } from '@nestjs/common';
import { ReportSharesRepository } from '../repository/report-shares.repository';
import { ReportSharesPaginatedQueryDto } from '../dto/request/report-shares-paginated-query.dto';
import { ReportSharesByUserQueryDto } from '../dto/request/report-shares-by-user-query.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { MostSharedFileDto } from '../dto/response/most-shared-file.dto';
import { SharedByUserItemDto } from '../dto/response/shared-by-user-item.dto';
import { ReceivedByUserItemDto } from '../dto/response/received-by-user-item.dto';
import { NeverSharedFileDto } from '../dto/response/never-shared-file.dto';

/* Principal service for share reports class*/
@Injectable()
export class ReportSharesService {
  constructor(private readonly repo: ReportSharesRepository) { }

  /* Method to list files with the most shares */
  async mostSharedFilesPage(
    query: ReportSharesPaginatedQueryDto,
  ): Promise<PageResponseDto<MostSharedFileDto>> {
    const { content, total } = await this.repo.mostSharedFilesPage(query);
    return PageResponseDto.of(content, total, query);
  }

  /* Method to list files shared by a selected user */
  async sharedByUserPage(
    query: ReportSharesByUserQueryDto,
  ): Promise<PageResponseDto<SharedByUserItemDto>> {
    const { content, total } = await this.repo.sharedByUserPage(query);
    return PageResponseDto.of(content, total, query);
  }

  /* Method to list files received from a selected user */
  async receivedByUserPage(
    query: ReportSharesByUserQueryDto,
  ): Promise<PageResponseDto<ReceivedByUserItemDto>> {
    const { content, total } = await this.repo.receivedByUserPage(query);
    return PageResponseDto.of(content, total, query);
  }

  /* Method to list files that have never been shared */
  async neverSharedFilesPage(
    query: ReportSharesPaginatedQueryDto,
  ): Promise<PageResponseDto<NeverSharedFileDto>> {
    const { content, total } = await this.repo.neverSharedFilesPage(query);
    return PageResponseDto.of(content, total, query);
  }
}
