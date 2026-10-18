import { PaginationQueryDto } from "./pagination-query.dto";

/**
 * Principal pagination response model
 * 
*/
export class PageResponseDto<T> {
  content!: T[];
  page!: number;
  size!: number;
  totalPages!: number;
  totalElements!: number;

  static of<T>(content: T[], total: number, q: PaginationQueryDto): PageResponseDto<T> {
    return { content, page: q.page, size: q.size, totalPages: Math.ceil(total / q.size), totalElements: total };
  }
}