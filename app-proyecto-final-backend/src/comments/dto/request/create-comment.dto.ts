import { IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trim } from 'src/common/utils/transforms';
import { OBJECT_ID_REGEX } from 'src/common/constants/regex/object-id';

/*Principal create comment dto model*/
export class CreateCommentDto {
  @Transform(trim)
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio' })
  @MinLength(1, { message: 'El comentario debe tener al menos 1 caracter' })
  @MaxLength(2000, { message: 'El comentario no puede exceder 2000 caracteres' })
  content!: string;

  @IsOptional()
  @Matches(OBJECT_ID_REGEX, { message: 'El parentId debe ser un ObjectId válido si se responde a un comentario' })
  parentId?: string | null;
}
