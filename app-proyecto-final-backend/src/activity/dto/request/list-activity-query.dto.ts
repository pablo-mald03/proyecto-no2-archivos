import { IsOptional, Matches } from "class-validator";
import { MyActivityQueryDto } from "./my-activity-query.dto";
import { OBJECT_ID_REGEX } from "src/common/constants/regex/object-id";

// Principal model for all list activity query dto
export class ListActivityQueryDto extends MyActivityQueryDto {
  @IsOptional()
  @Matches(OBJECT_ID_REGEX, { message: 'El identificador del usuario no es válido' })
  actorId?: string;
}