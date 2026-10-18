import { Transform } from "class-transformer";
import { IsString, Length, Matches } from "class-validator";
import { FieldLimits } from "src/common/constants/validation/field-limits";
import { trimUpperCase } from "src/common/utils/transforms";

//Principal assign role request dto class
export class AssignRoleDto {
  @Transform(trimUpperCase)
  @IsString({ message: 'El rol es obligatorio' })
  @Length(FieldLimits.ROLE_CODE.min, FieldLimits.ROLE_CODE.max, { message: 'El código del rol no es válido' })
  @Matches(/^[A-Z][A-Z0-9_]*$/, { message: 'El código del rol no es válido' })
  roleCode!: string;
}
