import { PartialType, PickType } from "@nestjs/swagger";
import { CreateRoleDto } from "./create-role.dto";


/*Update role rquest dto model class */
export class UpdateRoleDto extends PartialType(PickType(CreateRoleDto, ['name', 'description'] as const)) {}
