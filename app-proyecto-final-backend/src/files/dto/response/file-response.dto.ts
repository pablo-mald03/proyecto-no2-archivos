import { ApiProperty } from '@nestjs/swagger';
import { PageResponseDto } from 'src/common/dto/page-response.dto';

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
}

/*Swagger documentation for paginated files*/
export class PaginatedFilesResponseDto extends PageResponseDto<FileResponseDto> {
  @ApiProperty({ type: [FileResponseDto] })
  declare content: FileResponseDto[];
}
