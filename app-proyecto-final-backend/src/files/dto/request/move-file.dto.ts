import { IsOptional, Matches } from 'class-validator';
import { OBJECT_ID_REGEX } from 'src/common/constants/regex/object-id';

export class MoveFileDto {
  @IsOptional()
  @Matches(OBJECT_ID_REGEX, { message: 'El targetFolderId debe ser un ObjectId válido o null' })
  targetFolderId?: string | null = null;
}
