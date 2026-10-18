import { IsBoolean } from "class-validator";

/*Change role status request dto model class */
export class ChangeRoleStatusDto {
  @IsBoolean({ message: 'El estado es obligatorio' })
  isActive!: boolean;
}