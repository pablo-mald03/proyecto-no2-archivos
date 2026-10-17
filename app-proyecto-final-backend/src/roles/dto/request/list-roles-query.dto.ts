import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { trim } from "src/common/utils/transforms";
import { ROLE_SORT_FIELDS } from "src/roles/filter/role-request.filter";


/*Role list query request dto model */
export class ListRolesQueryDto extends PaginationQueryDto {
  @IsIn(ROLE_SORT_FIELDS, { message: 'El campo de ordenamiento no es válido' })
  sortBy: (typeof ROLE_SORT_FIELDS)[number] = 'name';

  @IsIn(['asc', 'desc'], { message: 'La dirección debe ser asc o desc' })
  direction: 'asc' | 'desc' = 'asc';

  @IsOptional() @Transform(trim) @IsString() @MaxLength(100)
  search?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean({ message: 'El filtro de estado debe ser true o false' })
  isActive?: boolean;
}