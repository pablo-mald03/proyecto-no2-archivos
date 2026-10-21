import { ApiProperty } from '@nestjs/swagger';

//Received by user item dto model
export class ReceivedByUserItemDto {
  @ApiProperty({ example: '64a9f8b1c2e3f4a5b6c7d8e9', description: 'ID del registro de compartido' })
  shareId!: string;

  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111', description: 'ID del recurso recibido' })
  resourceId!: string;

  @ApiProperty({ example: 'Proyecto_Final.docx', description: 'Nombre del recurso' })
  resourceName!: string;

  @ApiProperty({ enum: ['FILE', 'FOLDER'], example: 'FILE', description: 'Tipo de recurso' })
  resourceType!: 'FILE' | 'FOLDER';

  @ApiProperty({ example: 'VIEWER', description: 'Nivel de acceso asignado' })
  accessLevel!: string;

  @ApiProperty({ example: 'USER', description: 'Tipo de beneficiario' })
  granteeType!: string;

  @ApiProperty({ example: 'owner_user', description: 'Username del propietario del archivo' })
  ownerUsername!: string;

  @ApiProperty({ example: 'owner@example.com', description: 'Email del propietario del archivo' })
  ownerEmail!: string;

  @ApiProperty({ example: '2026-03-20T14:15:00.000Z', description: 'Fecha en que se recibió el recurso' })
  receivedAt!: string;
}