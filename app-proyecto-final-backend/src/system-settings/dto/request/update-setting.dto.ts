import { IsDefined } from "class-validator";

//Principal request model dto for the setting
export class UpdateSettingDto {
  @IsDefined({ message: 'El valor es obligatorio' })
  value!: string | number;
}
