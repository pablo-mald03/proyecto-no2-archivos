import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessLevel } from '../constants/permissions/access-level';

/* Resource permissions DTO for ACL metadata */
export class ResourcePermissionsDto {
  @ApiProperty({
    example: 'OWNER',
    enum: ['OWNER', 'VIEWER', 'COMMENTER', 'EDITOR'],
    description: 'Nivel de acceso o rol sobre el recurso (OWNER si es propietario, o nivel de la ACL)',
  })
  role!: AccessLevel | 'OWNER';

  @ApiPropertyOptional({
    example: '60d5ecb8b5c9c22b1c8e4111',
    nullable: true,
    description: 'ID de la carpeta desde donde se heredó el permiso (null si es directo o OWNER)',
  })
  inheritedFromFolderId?: string | null;

  @ApiPropertyOptional({
    example: 'Carpeta Contenedora',
    nullable: true,
    description: 'Nombre de la carpeta contenedora directa (null si está en la raíz)',
  })
  parentName?: string | null;
}
