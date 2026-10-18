import { PickType } from "@nestjs/swagger";
import { CreateRoleDto } from "./create-role.dto";

//Update role permission request dto model class
export class UpdateRolePermissionsDto extends PickType(CreateRoleDto, 
    ['permissions'] as const
) 
{

}
