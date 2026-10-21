import { ApiProperty } from '@nestjs/swagger';

/** Storage percentage per user response model */
export class UserStoragePercentageDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del usuario' })
  userId!: string;

  @ApiProperty({ example: 'johndoe', description: 'Nombre de usuario' })
  username!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Correo electrónico' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo del usuario' })
  fullName!: string;

  @ApiProperty({ example: 8589934592, description: 'Bytes consumidos por el usuario' })
  usedBytes!: number;

  @ApiProperty({ example: 10737418240, description: 'Límite de cuota asignada en bytes' })
  quotaBytes!: number;

  @ApiProperty({ example: 80.0, description: 'Porcentaje consumido de la cuota (0 a 100)' })
  percentageUsed!: number;
}