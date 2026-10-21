import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { trim } from 'src/common/utils/transforms';

/* Query DTO for listing folders by user with pagination and search */
export class ListUserFoldersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['name', 'createdAt', 'updatedAt'], {
    message: 'El campo de ordenamiento no es válido',
  })
  sortBy?: 'name' | 'createdAt' | 'updatedAt' = 'name';

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;
}
