import { IsNotEmpty } from 'class-validator';
import { GrantShareEntryDto } from './grant-share-entry.dto';

/*Principal share resource dto model*/
export class ShareResourceDto {
  @IsNotEmpty({ message: 'La lista de permisos a otorgar no puede estar vacía' })
  shares!: GrantShareEntryDto[];
}
