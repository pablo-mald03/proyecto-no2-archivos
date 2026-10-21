import { ApiProperty } from '@nestjs/swagger';

export class MostSharedFileDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del archivo' })
  fileId!: string;

  @ApiProperty({ example: 'reporte_anual.pdf', description: 'Nombre del archivo' })
  fileName!: string;

  @ApiProperty({ example: 'pdf', description: 'Extensión del archivo' })
  extension!: string;

  @ApiProperty({ example: 'johndoe', description: 'Username del propietario' })
  ownerUsername!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email del propietario' })
  ownerEmail!: string;

  @ApiProperty({ example: 25, description: 'Cantidad total de veces compartido' })
  shareCount!: number;
}