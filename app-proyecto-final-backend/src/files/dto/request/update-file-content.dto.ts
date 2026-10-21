import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFileContentDto {
  @IsNotEmpty({ message: 'El contenido no puede estar vacío' })
  @IsString({ message: 'El contenido debe ser texto' })
  content!: string;
}
