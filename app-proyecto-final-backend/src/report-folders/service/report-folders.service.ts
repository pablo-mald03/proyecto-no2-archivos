import { Injectable } from '@nestjs/common';
import { ReportFoldersRepository } from '../repository/report-folders.repository';
import { ReportFoldersPaginatedQueryDto } from '../dto/request/report-folders-paginated-query.dto';
import { ReportFoldersByUserQueryDto } from '../dto/request/report-folders-by-user-query.dto';
import { ReportFoldersByFolderQueryDto } from '../dto/request/report-folders-by-folder-query.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { FolderWithMostFilesDto } from '../dto/response/folder-with-most-files.dto';
import { UserRootFolderSpaceDto } from '../dto/response/user-root-folder-space.dto';
import { FolderContentReportItemDto } from '../dto/response/folder-content-report-item.dto';

/* Principal service for folder reports */
@Injectable()
export class ReportFoldersService {
  constructor(private readonly repo: ReportFoldersRepository) { }

  /* Method to list folders with the most files */
  async foldersWithMostFilesPage(query: ReportFoldersPaginatedQueryDto): Promise<PageResponseDto<FolderWithMostFilesDto>> {
    const { content, total } = await this.repo.foldersWithMostFilesPage(query);
    return PageResponseDto.of(content, total, query);
  }

  /* Method to list space used by root folders of a user */
  async userRootFoldersSpacePage(query: ReportFoldersByUserQueryDto): Promise<PageResponseDto<UserRootFolderSpaceDto>> {
    const { content, total } = await this.repo.userRootFoldersSpacePage(query);
    return PageResponseDto.of(content, total, query);
  }

  /* Method to list contents of a folder and its subfolders */
  async folderContentsPage(query: ReportFoldersByFolderQueryDto): Promise<PageResponseDto<FolderContentReportItemDto>> {
    const { content, total } = await this.repo.folderContentsPage(query);
    return PageResponseDto.of(content, total, query);
  }
}
