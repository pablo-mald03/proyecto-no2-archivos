import { FolderResponseDto } from './folder-response.dto';

export class FolderBreadcrumbDto {
  id!: string;
  name!: string;
}

export class FolderContentResponseDto {
  currentFolder!: FolderResponseDto | null;
  breadcrumbs!: FolderBreadcrumbDto[];
  folders!: FolderResponseDto[];
  files!: any[]; // To be typed with FileResponseDto once files module is built
}
