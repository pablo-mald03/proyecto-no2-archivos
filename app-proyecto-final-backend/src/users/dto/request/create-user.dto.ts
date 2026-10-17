import { OmitType, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Length, Matches, MaxLength } from "class-validator";
import { FieldLimits } from "src/common/constants/validation/field-limits";
import { trim, trimLowerCase, trimUpperCase } from "src/common/utils/transforms";

//Principal create user dto model
export class CreateUserDto {
  @Transform(trimLowerCase)
  @IsString({ message: 'El username es obligatorio' })
  @Length(FieldLimits.USERNAME.min, FieldLimits.USERNAME.max,
    { message: `El username debe tener entre ${FieldLimits.USERNAME.min} y ${FieldLimits.USERNAME.max} caracteres` })
  username!: string;

  @Transform(trimLowerCase)
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @MaxLength(FieldLimits.EMAIL.max, { message: `El correo no debe superar los ${FieldLimits.EMAIL.max} caracteres` })
  email!: string;

  @Transform(trim)
  @IsString({ message: 'El nombre es obligatorio' })
  @Length(FieldLimits.PERSON_NAME.min, FieldLimits.PERSON_NAME.max,
    { message: `El nombre debe tener entre ${FieldLimits.PERSON_NAME.min} y ${FieldLimits.PERSON_NAME.max} caracteres` })
  firstName!: string;

  @Transform(trim)
  @IsString({ message: 'El apellido es obligatorio' })
  @Length(FieldLimits.PERSON_NAME.min, FieldLimits.PERSON_NAME.max,
    { message: `El apellido debe tener entre ${FieldLimits.PERSON_NAME.min} y ${FieldLimits.PERSON_NAME.max} caracteres` })
  lastName!: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @Length(FieldLimits.PASSWORD.min, FieldLimits.PASSWORD.max,
    { message: `La contraseña debe tener entre ${FieldLimits.PASSWORD.min} y ${FieldLimits.PASSWORD.max} caracteres` })
  password!: string;

  @Transform(trimUpperCase)
  @IsString({ message: 'El rol es obligatorio' })
  @Length(FieldLimits.ROLE_CODE.min, FieldLimits.ROLE_CODE.max, { message: 'El código del rol no es válido' })
  @Matches(/^[A-Z][A-Z0-9_]*$/, { message: 'El código del rol no es válido' })
  roleCode!: string;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'roleCode'] as const)) {}