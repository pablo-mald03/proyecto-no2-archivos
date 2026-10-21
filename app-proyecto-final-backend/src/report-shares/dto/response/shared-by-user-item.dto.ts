import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Shared by user item dto model
export class SharedByUserItemDto {
  @ApiProperty({ example: '64a9f8b1c2e3f4a5b6c7d8e9', description: 'ID del registro de compartido' })
  shareId!: string;

  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del recurso compartido' })
  resourceId!: string;

  @ApiProperty({ example: 'Documentos Importantes', description: 'Nombre del recurso' })
  resourceName!: string;

  @ApiProperty({ enum: ['FILE', 'FOLDER'], example: 'FILE', description: 'Tipo de recurso' })
  resourceType!: 'FILE' | 'FOLDER';

  @ApiProperty({ example: 'EDITOR', description: 'Nivel de acceso otorgado' })
  accessLevel!: string;

  @ApiProperty({ example: 'USER', description: 'Tipo de beneficiario' })
  granteeType!: string;

  @ApiPropertyOptional({ example: 'janedoe', description: 'Username del beneficiario' })
  granteeUsername?: string;

  @ApiPropertyOptional({ example: 'jane@example.com', description: 'Email del beneficiario' })
  granteeEmail?: string;

  @ApiProperty({ example: '2026-03-15T10:30:00.000Z', description: 'Fecha de creación del compartido' })
  sharedAt!: string;
}