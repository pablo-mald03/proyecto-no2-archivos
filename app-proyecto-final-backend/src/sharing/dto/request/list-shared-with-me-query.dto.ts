import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { trim, trimLowerCase } from 'src/common/utils/transforms';
import { AccessLevel } from 'src/common/constants/permissions/access-level';

export const SHARED_WITH_ME_SORT_FIELDS = ['sharedAt', 'name', 'updatedAt', 'sizeBytes'] as const;
export type SharedWithMeSortField = (typeof SHARED_WITH_ME_SORT_FIELDS)[number];

/*Principal query DTO for listing resources shared with the authenticated user*/
export class ListSharedWithMeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: SHARED_WITH_ME_SORT_FIELDS,
    default: 'sharedAt',
    description: 'Field to sort shared items by',
  })
  @IsOptional()
  @IsIn(SHARED_WITH_ME_SORT_FIELDS, {
    message: 'El campo de ordenamiento debe ser sharedAt, name, updatedAt o sizeBytes',
  })
  sortBy: SharedWithMeSortField = 'sharedAt';

  @ApiPropertyOptional({ description: 'Filter by resource name' })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({
    enum: ['ALL', 'FILES_ONLY', 'FOLDERS_ONLY'],
    default: 'ALL',
    description: 'Filter by resource type',
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

  @ApiPropertyOptional({
    enum: Object.values(AccessLevel),
    description: 'Filter by granted access level',
  })
  @IsOptional()
  @IsIn(Object.values(AccessLevel), {
    message: 'El nivel de acceso debe ser VIEWER, COMMENTER o EDITOR',
  })
  access?: AccessLevel;

  @ApiPropertyOptional({ description: 'Filter items shared from this date (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha desde debe ser una fecha válida' })
  from?: Date;

  @ApiPropertyOptional({ description: 'Filter items shared up to this date (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha hasta debe ser una fecha válida' })
  to?: Date;
}
