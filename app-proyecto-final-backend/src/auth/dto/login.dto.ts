import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El correo no tiene un formato válido' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    email!: string;

    @MaxLength(128, { message: 'La contraseña es demasiado larga' })
    @IsString({ message: 'La contraseña debe ser texto' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    password!: string;
}