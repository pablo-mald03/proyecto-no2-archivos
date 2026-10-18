import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";

/*Update user dto request */
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'roleCode'] as const)) {}