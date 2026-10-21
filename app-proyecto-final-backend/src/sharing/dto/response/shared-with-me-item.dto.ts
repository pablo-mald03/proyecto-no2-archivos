import { ApiProperty } from '@nestjs/swagger';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { ShareResponseDto } from './share-response.dto';

/*Metadata DTO for the shared resource (file or folder)*/
export class SharedResourceMetadataDto {
  @ApiProperty({ example: '673f8a1...' })
  id!: string;

  @ApiProperty({ enum: ['FILE', 'FOLDER'], example: 'FILE' })
  type!: 'FILE' | 'FOLDER';

  @ApiProperty({ example: 'documento.txt' })
  name!: string;

  @ApiProperty({ required: false, example: 'txt' })
  extension?: string;

  @ApiProperty({ required: false, example: 'text/plain' })
  mimeType?: string;

  @ApiProperty({ required: false, example: 1024 })
  sizeBytes?: number;

  @ApiProperty({ example: '673f8a0...' })
  ownerId!: string;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-20T11:00:00.000Z' })
  updatedAt!: string;
}

/*Principal shared with me item response dto*/
export class SharedWithMeItemDto {
  @ApiProperty({ type: () => ShareResponseDto })
  share!: ShareResponseDto;

  @ApiProperty({ type: () => SharedResourceMetadataDto })
  resource!: SharedResourceMetadataDto;
}

/*Swagger documentation for paginated shared with me items*/
export class PaginatedSharedWithMeResponseDto extends PageResponseDto<SharedWithMeItemDto> {
  @ApiProperty({ type: [SharedWithMeItemDto] })
  declare content: SharedWithMeItemDto[];
}
