import { ApiProperty } from '@nestjs/swagger';

/** Space used by root folders of a user response model */
export class UserRootFolderSpaceDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID de la carpeta principal' })
  folderId!: string;

  @ApiProperty({ example: 'Proyectos 2026', description: 'Nombre de la carpeta principal' })
  folderName!: string;

  @ApiProperty({ example: 104857600, description: 'Espacio total utilizado en bytes (incluyendo subcarpetas)' })
  totalSizeBytes!: number;

  @ApiProperty({ example: 120, description: 'Cantidad total de archivos contenidos (incluyendo subcarpetas)' })
  fileCount!: number;

  @ApiProperty({ example: '2026-01-15T08:30:00.000Z', description: 'Fecha de creación de la carpeta principal' })
  createdAt!: Date;
}
