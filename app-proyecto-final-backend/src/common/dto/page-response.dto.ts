// page-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { PaginationQueryDto } from "./pagination-query.dto";

/**
 * Principal pagination response model
 */
export class PageResponseDto<T> {
  @ApiProperty({ isArray: true, description: 'Elementos de la página actual' })
  content!: T[];

  @ApiProperty({ example: 1, description: 'Número de página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Tamaño de la página' })
  size!: number;

  @ApiProperty({ example: 5, description: 'Total de páginas disponibles' })
  totalPages!: number;

  @ApiProperty({ example: 48, description: 'Total de registros encontrados' })
  totalElements!: number;

  static of<T>(content: T[], total: number, q: PaginationQueryDto): PageResponseDto<T> {
    return {
      content,
      page: q.page,
      size: q.size,
      totalPages: Math.ceil(total / (q.size || 1)),
      totalElements: total,
    };
  }
}