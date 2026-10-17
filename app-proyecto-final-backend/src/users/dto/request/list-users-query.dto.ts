import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { trim, trimUpperCase } from "src/common/utils/transforms";

//Selected sort fields
export const USER_SORT_FIELDS = ['username', 'email', 'firstName', 'lastName', 'createdAt', 'lastLoginAt'] as const;

//User filter dto
export class ListUsersQueryDto extends PaginationQueryDto {
  @IsIn(USER_SORT_FIELDS, { message: 'El campo de ordenamiento no es válido' })
  sortBy: (typeof USER_SORT_FIELDS)[number] = 'createdAt';

  @IsOptional() @Transform(trim) @IsString() @MaxLength(100)
  search?: string;

  
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean({ message: 'El filtro de estado debe ser true o false' })
  isActive?: boolean;

  @IsOptional() @Transform(trimUpperCase) @IsString() @Matches(/^[A-Z][A-Z0-9_]*$/, { message: 'El código del rol no es válido' })
  roleCode?: string;
}