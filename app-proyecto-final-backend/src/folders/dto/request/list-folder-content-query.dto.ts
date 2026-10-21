import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { trim, trimLowerCase } from 'src/common/utils/transforms';
import { FOLDER_CONTENT_SORT_FIELDS, type FolderContentSortField } from 'src/folders/filter/folder-content-sort';

/*Principal list folder content query DTO model*/
export class ListFolderContentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(FOLDER_CONTENT_SORT_FIELDS, { message: 'El campo de ordenamiento no es válido' })
  sortBy: FolderContentSortField = 'name';

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @IsOptional()
  @IsIn(['ALL', 'FOLDERS_ONLY', 'FILES_ONLY'], {
    message: 'El tipo debe ser ALL, FOLDERS_ONLY o FILES_ONLY',
  })
  type?: 'ALL' | 'FOLDERS_ONLY' | 'FILES_ONLY' = 'ALL';

  @IsOptional()
  @Transform(trimLowerCase)
  @IsIn(['txt', 'md'], { message: 'La extensión solo puede ser txt o md' })
  extension?: 'txt' | 'md';
}
