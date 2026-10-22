/* Generic paginated response model (PageResponseDto) */
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
