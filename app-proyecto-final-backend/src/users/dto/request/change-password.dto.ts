import { IsNotEmpty, IsString, Length } from "class-validator";
import { FieldLimits } from "src/common/constants/field-limits";

/*Principal change password request dto class */
export class ChangePasswordDto {
  @IsString({ message: 'La contraseña actual es obligatoria' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  currentPassword!: string;

  @IsString({ message: 'La contraseña nueva es obligatoria' })
  @Length(FieldLimits.PASSWORD.min, FieldLimits.PASSWORD.max,
    { message: `La contraseña debe tener entre ${FieldLimits.PASSWORD.min} y ${FieldLimits.PASSWORD.max} caracteres` })
  newPassword!: string;

  @IsString({ message: 'La confirmación de contraseña es obligatoria' })
  @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria' })
  confirmationPassword!: string;
}