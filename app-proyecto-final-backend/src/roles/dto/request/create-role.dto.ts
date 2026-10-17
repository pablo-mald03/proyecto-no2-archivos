import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";
import { FieldLimits } from "src/common/constants/validation/field-limits";
import { trim, trimUpperCase, trimUpperCaseEach } from "src/common/utils/transforms";

//Create role dto class
export class CreateRoleDto {
  @Transform(trimUpperCase)
  @IsString({ message: 'El código es obligatorio' })
  @Length(FieldLimits.ROLE_CODE.min, FieldLimits.ROLE_CODE.max,
    { message: `El código debe tener entre ${FieldLimits.ROLE_CODE.min} y ${FieldLimits.ROLE_CODE.max} caracteres` })
  @Matches(/^[A-Z][A-Z0-9_]*$/, { message: 'El código solo admite letras mayúsculas, números y guion bajo' })
  code!: string;

  @Transform(trim)
  @IsString({ message: 'El nombre es obligatorio' })
  @Length(FieldLimits.ROLE_NAME.min, FieldLimits.ROLE_NAME.max,
    { message: `El nombre debe tener entre ${FieldLimits.ROLE_NAME.min} y ${FieldLimits.ROLE_NAME.max} caracteres` })
  name!: string;

  @IsOptional() @Transform(trim)
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(FieldLimits.DESCRIPTION.max,
    { message: `La descripción no debe superar los ${FieldLimits.DESCRIPTION.max} caracteres` })
  description?: string;

  @Transform(trimUpperCaseEach)
  @IsArray({ message: 'Los permisos deben enviarse como una lista' })
  @IsString({ each: true, message: 'Cada permiso debe ser un texto' })
  @Matches(/^[A-Z][A-Z0-9_]*$/, { each: true, message: 'Hay un código de permiso con formato inválido' })
  permissions!: string[];
}
