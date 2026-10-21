import { ApiProperty } from '@nestjs/swagger';

/** Top user by file count response model */
export class TopUserByFileCountDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del usuario' })
  userId!: string;

  @ApiProperty({ example: 'johndoe', description: 'Nombre de usuario' })
  username!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Correo electrónico' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo del usuario' })
  fullName!: string;

  @ApiProperty({ example: 342, description: 'Cantidad total de archivos creados' })
  fileCount!: number;
}