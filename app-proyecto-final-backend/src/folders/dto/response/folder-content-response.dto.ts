import { FolderBreadcrumbDto } from './folder-breadcrum-response.dto';
import { FolderResponseDto } from './folder-response.dto';
import { FileResponseDto } from 'src/files/dto/response/file-response.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';

/*Principal folder content response dto model with pagination*/
export class FolderContentResponseDto {
  currentFolder!: FolderResponseDto | null;
  breadcrumbs!: FolderBreadcrumbDto[];
  folders!: PageResponseDto<FolderResponseDto>;
  files!: PageResponseDto<FileResponseDto>;
}
