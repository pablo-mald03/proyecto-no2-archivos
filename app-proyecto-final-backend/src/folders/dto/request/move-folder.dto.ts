import { IsOptional, Matches } from 'class-validator';
import { OBJECT_ID_REGEX } from 'src/common/constants/regex/object-id';

export class MoveFolderDto {
  @IsOptional()
  @Matches(OBJECT_ID_REGEX, { message: 'El targetParentId debe ser un ObjectId válido o null' })
  targetParentId?: string | null = null;
}
