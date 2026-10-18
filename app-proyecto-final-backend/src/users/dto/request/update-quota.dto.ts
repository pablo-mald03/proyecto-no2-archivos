import { IsInt, Max, Min } from "class-validator";

/*Principal update quita for storage bytes request dto class */
export class UpdateQuotaDto {
  @IsInt({ message: 'La cuota debe ser un número entero de bytes' })
  @Min(0, { message: 'La cuota no puede ser negativa' })
  @Max(Number.MAX_SAFE_INTEGER, { message: 'La cuota excede el máximo permitido' })
  quotaBytes!: number;
}
