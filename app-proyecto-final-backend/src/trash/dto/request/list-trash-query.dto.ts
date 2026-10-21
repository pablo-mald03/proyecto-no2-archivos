import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { trim, trimLowerCase } from 'src/common/utils/transforms';

export const TRASH_SORT_FIELDS = ['deletedAt', 'name', 'sizeBytes'] as const;
export type TrashSortField = (typeof TRASH_SORT_FIELDS)[number];

/*Principal query DTO for listing trashed items with pagination and filters*/
export class ListTrashQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TRASH_SORT_FIELDS,
    default: 'deletedAt',
    description: 'Field to sort trash items by',
  })
  @IsOptional()
  @IsIn(TRASH_SORT_FIELDS, {
    message: 'El campo de ordenamiento debe ser deletedAt, name o sizeBytes',
  })
  sortBy: TrashSortField = 'deletedAt';

  @ApiPropertyOptional({ description: 'Filter by item name' })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({
    enum: ['ALL', 'FILES_ONLY', 'FOLDERS_ONLY'],
    default: 'ALL',
    description: 'Filter by item type',
  })
  @IsOptional()
  @IsIn(['ALL', 'FILES_ONLY', 'FOLDERS_ONLY'], {
    message: 'El tipo debe ser ALL, FILES_ONLY o FOLDERS_ONLY',
  })
  type?: 'ALL' | 'FILES_ONLY' | 'FOLDERS_ONLY' = 'ALL';

  @ApiPropertyOptional({ enum: ['txt', 'md'], description: 'Filter files by extension' })
  @IsOptional()
  @Transform(trimLowerCase)
  @IsIn(['txt', 'md'], { message: 'La extensión solo puede ser txt o md' })
  extension?: 'txt' | 'md';

  @ApiPropertyOptional({ description: 'Filter items deleted from this date (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha desde debe ser una fecha válida' })
  from?: Date;

  @ApiPropertyOptional({ description: 'Filter items deleted up to this date (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha hasta debe ser una fecha válida' })
  to?: Date;
}
