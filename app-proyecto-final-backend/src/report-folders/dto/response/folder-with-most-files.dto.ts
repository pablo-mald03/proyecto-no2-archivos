import { ApiProperty } from '@nestjs/swagger';

/** Folders with most files response model */
export class FolderWithMostFilesDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID de la carpeta' })
  folderId!: string;

  @ApiProperty({ example: 'Documentos Importantes', description: 'Nombre de la carpeta' })
  folderName!: string;

  @ApiProperty({ example: 'johndoe', description: 'Nombre de usuario del propietario' })
  ownerUsername!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Correo electrónico del propietario' })
  ownerEmail!: string;

  @ApiProperty({ example: 45, description: 'Cantidad total de archivos contenidos en la carpeta' })
  fileCount!: number;

  @ApiProperty({ example: '2026-01-15T08:30:00.000Z', description: 'Fecha de creación de la carpeta' })
  createdAt!: Date;
}
