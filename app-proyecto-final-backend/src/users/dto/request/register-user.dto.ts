import { OmitType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";


/*Principal register user dto */
export class RegisterUserDto extends OmitType(CreateUserDto, ['roleCode'] as const) {}