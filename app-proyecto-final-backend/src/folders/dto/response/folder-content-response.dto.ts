import { FolderBreadcrumbDto } from './folder-breadcrum-response.dto';
import { FolderResponseDto } from './folder-response.dto';
import { FileResponseDto, PaginatedFilesResponseDto } from 'src/files/dto/response/file-response.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { ApiProperty } from '@nestjs/swagger';

/* Principal folder content response dto model with pagination */
export class FolderContentResponseDto {
  @ApiProperty({ type: () => FolderResponseDto, nullable: true })
  currentFolder!: FolderResponseDto | null;

  @ApiProperty({ type: () => [FolderBreadcrumbDto] })
  breadcrumbs!: FolderBreadcrumbDto[];

  @ApiProperty({ type: () => PaginatedFoldersResponseDto })
  folders!: PageResponseDto<FolderResponseDto>;

  @ApiProperty({ type: () => PaginatedFilesResponseDto })
  files!: PageResponseDto<FileResponseDto>;
}


/* Swagger documentation for paginated folders */
export class PaginatedFoldersResponseDto extends PageResponseDto<FolderResponseDto> {
  @ApiProperty({ type: [FolderResponseDto] })
  declare content: FolderResponseDto[];
}


