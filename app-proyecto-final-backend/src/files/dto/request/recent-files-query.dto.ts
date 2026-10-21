import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { trim, trimLowerCase } from 'src/common/utils/transforms';

export const RECENT_FILES_SORT_FIELDS = ['updatedAt', 'createdAt', 'name', 'sizeBytes'] as const;
export type RecentFilesSortField = (typeof RECENT_FILES_SORT_FIELDS)[number];

/*Principal query DTO for listing recent files with pagination and filters*/
export class RecentFilesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: RECENT_FILES_SORT_FIELDS,
    default: 'updatedAt',
    description: 'Field to sort recent files by',
  })
  @IsOptional()
  @IsIn(RECENT_FILES_SORT_FIELDS, {
    message: 'El campo de ordenamiento debe ser updatedAt, createdAt, name o sizeBytes',
  })
  sortBy: RecentFilesSortField = 'updatedAt';

  @ApiPropertyOptional({ description: 'Filter by file name' })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({ enum: ['txt', 'md'], description: 'Filter by extension' })
  @IsOptional()
  @Transform(trimLowerCase)
  @IsIn(['txt', 'md'], { message: 'La extensión solo puede ser txt o md' })
  extension?: 'txt' | 'md';

  @ApiPropertyOptional({ description: 'Filter files modified/created from this date (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha desde debe ser una fecha válida' })
  from?: Date;

  @ApiPropertyOptional({ description: 'Filter files modified/created up to this date (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha hasta debe ser una fecha válida' })
  to?: Date;
}
