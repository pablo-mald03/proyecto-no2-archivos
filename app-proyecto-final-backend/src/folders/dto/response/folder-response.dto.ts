import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourcePermissionsDto } from 'src/common/dto/resource-permissions.dto';

/*Principal folder response dto model */
export class FolderResponseDto {
  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4111' })
  id!: string;

  @ApiProperty({ example: '60d5ecb8b5c9c22b1c8e4000' })
  ownerId!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId!: string | null;

  @ApiProperty({ example: 'Documentos' })
  name!: string;

  @ApiProperty({ type: [String], example: [] })
  ancestors!: string[];

  @ApiProperty({ example: '2026-01-15T08:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T08:30:00.000Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: () => ResourcePermissionsDto, required: false })
  permissions?: ResourcePermissionsDto;
}

