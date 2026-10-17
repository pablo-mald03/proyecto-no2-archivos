import { IsBoolean } from "class-validator";

/*Principal change status dto class request */
export class ChangeUserStatusDto {
  @IsBoolean({ message: 'El estado es obligatorio' })
  isActive!: boolean;
}