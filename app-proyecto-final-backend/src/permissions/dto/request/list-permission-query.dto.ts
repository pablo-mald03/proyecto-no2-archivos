import { IsIn, IsOptional, IsString, Length, MaxLength } from "class-validator";
import { PERMISSION_SORT_FIELDS } from "../../filter/list-permissions-query.dto";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { Transform } from "class-transformer";
import { FieldLimits } from "src/common/constants/validation/field-limits";
import { trim, trimUpperCase } from "src/common/utils/transforms";

//Principal list permission query dto
export class ListPermissionsQueryDto extends PaginationQueryDto {
  @IsIn(PERMISSION_SORT_FIELDS, { message: 'El campo de ordenamiento no es válido' })
  sortBy: (typeof PERMISSION_SORT_FIELDS)[number] = 'module';

  direction: 'asc' | 'desc' = 'asc'; 

  @IsOptional() @Transform(trimUpperCase) @IsString()
  @Length(FieldLimits.PERMISSION_MODULE.min, FieldLimits.PERMISSION_MODULE.max)
  module?: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(100)
  search?: string;
}
