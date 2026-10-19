import { FolderBreadcrumbDto } from './folder-breadcrum-response.dto';
import { FolderResponseDto } from './folder-response.dto';
import { FileResponseDto } from 'src/files/dto/response/file-response.dto';

/*Principal folder content response dto model*/
export class FolderContentResponseDto {
  currentFolder!: FolderResponseDto | null;
  breadcrumbs!: FolderBreadcrumbDto[];
  folders!: FolderResponseDto[];
  files!: FileResponseDto[];
}
