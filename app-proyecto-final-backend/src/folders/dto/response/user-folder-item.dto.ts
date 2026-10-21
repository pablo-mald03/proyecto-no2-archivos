import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/* User folder item response model */
export class UserFolderItemDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID de la carpeta' })
  id!: string;

  @ApiProperty({ example: 'Documentos', description: 'Nombre de la carpeta' })
  name!: string;

  @ApiPropertyOptional({ example: '60d5ecb8b5c9c22b1c8e4000', description: 'ID de la carpeta contenedora directa (null si está en la raíz)' })
  parentId!: string | null;

  @ApiProperty({ example: '2026-01-15T08:30:00.000Z', description: 'Fecha de creación de la carpeta' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T08:30:00.000Z', description: 'Fecha de última actualización de la carpeta' })
  updatedAt!: string;
}
