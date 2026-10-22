import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Folder content report item response model */
export class FolderContentReportItemDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del recurso (archivo o carpeta)' })
  resourceId!: string;

  @ApiProperty({ example: 'informe_final', description: 'Nombre del recurso' })
  resourceName!: string;

  @ApiProperty({ example: 'FILE', enum: ['FILE', 'FOLDER'], description: 'Tipo de recurso' })
  resourceType!: 'FILE' | 'FOLDER';

  @ApiPropertyOptional({ example: 'txt', description: 'Extensión del archivo (si aplica)' })
  extension?: string | null;

  @ApiPropertyOptional({ example: 2048, description: 'Tamaño en bytes (si aplica)' })
  sizeBytes?: number | null;

  @ApiPropertyOptional({ example: '60d5ecb8b5c9c22b1c8e4000', description: 'ID de la carpeta contenedora directa' })
  parentFolderId?: string | null;

  @ApiProperty({ example: '2026-01-15T08:30:00.000Z', description: 'Fecha de creación del recurso' })
  createdAt!: Date;
}
