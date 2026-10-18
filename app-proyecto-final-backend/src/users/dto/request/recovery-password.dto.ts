import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from "class-validator";
import { FieldLimits } from "src/common/constants/validation/field-limits";
import { trim, trimLowerCase } from "src/common/utils/transforms";

/*Recovery password dto model */
export class RecoverPasswordDto {
    @Transform(trimLowerCase)
    @MaxLength(FieldLimits.USERNAME.max, { message: `El nombre de usuario no debe superar los ${FieldLimits.USERNAME.max} caracteres` })
    @IsString({ message: 'El nombre de usuario es obligatorio' })
    username!: string;

    @Transform(trimLowerCase)
    @MaxLength(FieldLimits.EMAIL.max, { message: `El correo no debe superar los ${FieldLimits.EMAIL.max} caracteres` })
    @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
    email!: string;

    @Length(FieldLimits.PASSWORD.min, FieldLimits.PASSWORD.max,
        { message: `La contraseña debe tener entre ${FieldLimits.PASSWORD.min} y ${FieldLimits.PASSWORD.max} caracteres` })
    @IsString({ message: 'La contraseña es obligatoria' })
    password!: string;

    @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria' })
    @IsString({ message: 'La confirmación de contraseña es obligatoria' })
    confirmationPassword!: string;
}