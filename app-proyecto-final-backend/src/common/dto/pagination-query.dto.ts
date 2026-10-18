import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

/*Principal pagination query dto model */
export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(0, { message: 'La página no puede ser negativa' })
  page: number = 0;

  @Type(() => Number)
  @IsInt({ message: 'El tamaño debe ser un número entero' })
  @Min(1) @Max(100, { message: 'El tamaño máximo es 100' })
  size: number = 10;

  @IsOptional() @IsIn(['asc', 'desc'], { message: 'La dirección debe ser asc o desc' })
  direction: 'asc' | 'desc' = 'desc';
}