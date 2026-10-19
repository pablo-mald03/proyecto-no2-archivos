import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { FieldLimits } from 'src/common/constants/validation/field-limits';
import { trim } from 'src/common/utils/transforms';

export class RenameFileDto {
  @Transform(trim)
  @IsNotEmpty({ message: 'El nombre del archivo es obligatorio' })
  @MinLength(FieldLimits.RESOURCE_NAME.min, {
    message: `El nombre debe tener al menos ${FieldLimits.RESOURCE_NAME.min} caracteres`,
  })
  @MaxLength(FieldLimits.RESOURCE_NAME.max, {
    message: `El nombre no puede exceder ${FieldLimits.RESOURCE_NAME.max} caracteres`,
  })
  name!: string;
}
