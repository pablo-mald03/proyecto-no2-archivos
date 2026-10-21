import { ApiProperty } from '@nestjs/swagger';
import { PageResponseDto } from 'src/common/dto/page-response.dto';

/*Principal trash item response dto*/
export class TrashItemDto {
  @ApiProperty({ example: '673f8a1...' })
  id!: string;

  @ApiProperty({ example: 'apuntes.txt' })
  name!: string;

  @ApiProperty({ enum: ['FILE', 'FOLDER'], example: 'FILE' })
  type!: 'FILE' | 'FOLDER';

  @ApiProperty({ example: '673f8a2...' })
  trashBatchId!: string;

  @ApiProperty({ example: '2026-10-20T21:00:00.000Z' })
  deletedAt!: string;

  @ApiProperty({ required: false, example: 1024 })
  sizeBytes?: number;

  @ApiProperty({ required: false, example: 'txt' })
  extension?: string;
}

/*Swagger documentation for paginated trash items*/
export class PaginatedTrashResponseDto extends PageResponseDto<TrashItemDto> {
  @ApiProperty({ type: [TrashItemDto] })
  declare content: TrashItemDto[];
}

/*Response DTO for empty trash operation*/
export class EmptyTrashResponseDto {
  @ApiProperty({ example: 3, description: 'Number of folders permanently deleted' })
  deletedFoldersCount!: number;

  @ApiProperty({ example: 12, description: 'Number of files permanently deleted' })
  deletedFilesCount!: number;

  @ApiProperty({ example: 20480, description: 'Total storage bytes freed' })
  bytesReleased!: number;
}
