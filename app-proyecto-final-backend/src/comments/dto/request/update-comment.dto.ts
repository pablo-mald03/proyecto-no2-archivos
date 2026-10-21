import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trim } from 'src/common/utils/transforms';

/*Principal update comment dto model*/
export class UpdateCommentDto {
  @Transform(trim)
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio' })
  @MinLength(1, { message: 'El comentario debe tener al menos 1 caracter' })
  @MaxLength(2000, { message: 'El comentario no puede exceder 2000 caracteres' })
  content!: string;
}
