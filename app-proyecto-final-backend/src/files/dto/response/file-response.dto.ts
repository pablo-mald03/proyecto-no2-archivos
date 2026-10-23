import { ApiProperty } from '@nestjs/swagger';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { ResourcePermissionsDto } from 'src/common/dto/resource-permissions.dto';

/*Principal file response DTO model*/
export class FileResponseDto {
  id!: string;
  ownerId!: string;
  folderId!: string | null;
  name!: string;
  extension!: 'txt' | 'md';
  mimeType!: string;
  sizeBytes!: number;
  createdAt!: string;
  updatedAt!: string;

  @ApiProperty({ type: () => ResourcePermissionsDto, required: false })
  permissions?: ResourcePermissionsDto;
}

/*Swagger documentation for paginated files*/
export class PaginatedFilesResponseDto extends PageResponseDto<FileResponseDto> {
  @ApiProperty({ type: [FileResponseDto] })
  declare content: FileResponseDto[];
}
