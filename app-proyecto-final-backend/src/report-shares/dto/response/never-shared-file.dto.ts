import { ApiProperty } from '@nestjs/swagger';

// Never shared file dto model
export class NeverSharedFileDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del archivo' })
  fileId!: string;

  @ApiProperty({ example: 'borrador_secreto.txt', description: 'Nombre del archivo' })
  fileName!: string;

  @ApiProperty({ example: 'txt', description: 'Extensión del archivo' })
  extension!: string;

  @ApiProperty({ example: 2048576, description: 'Tamaño del archivo en bytes' })
  sizeBytes!: number;

  @ApiProperty({ example: 'alice', description: 'Username del propietario' })
  ownerUsername!: string;

  @ApiProperty({ example: 'alice@example.com', description: 'Email del propietario' })
  ownerEmail!: string;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z', description: 'Fecha de creación del archivo' })
  createdAt!: string;
}