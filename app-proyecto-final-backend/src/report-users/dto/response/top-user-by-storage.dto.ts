import { ApiProperty } from '@nestjs/swagger';

/** Top user by storage used response model */
export class TopUserByStorageDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del usuario' })
  userId!: string;

  @ApiProperty({ example: 'johndoe', description: 'Nombre de usuario' })
  username!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Correo electrónico' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo del usuario' })
  fullName!: string;

  @ApiProperty({ example: 8589934592, description: 'Bytes consumidos por el usuario (ej. 8 GB)' })
  usedBytes!: number;

  @ApiProperty({ example: 10737418240, description: 'Límite de cuota asignada en bytes (ej. 10 GB)' })
  quotaBytes!: number;
}