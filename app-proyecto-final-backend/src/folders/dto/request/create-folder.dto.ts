import { IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { FieldLimits } from 'src/common/constants/validation/field-limits';
import { OBJECT_ID_REGEX } from 'src/common/constants/regex/object-id';
import { trim } from 'src/common/utils/transforms';

/*Principal create folder dto model */
export class CreateFolderDto {
  @Transform(trim)
  @IsNotEmpty({ message: 'El nombre de la carpeta es obligatorio' })
  @MinLength(FieldLimits.RESOURCE_NAME.min, {
    message: `El nombre debe tener al menos ${FieldLimits.RESOURCE_NAME.min} caracter(es)`,
  })
  @MaxLength(FieldLimits.RESOURCE_NAME.max, {
    message: `El nombre no puede exceder ${FieldLimits.RESOURCE_NAME.max} caracteres`,
  })
  name!: string;

  @IsOptional()
  @Matches(OBJECT_ID_REGEX, { message: 'El parentId debe ser un ObjectId válido' })
  parentId?: string | null;
}
