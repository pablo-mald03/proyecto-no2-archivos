import { TrashItem } from './trash-item.model';

/*Paginated response wrapper for trash items */
export interface PaginatedTrashResponse {
  content: TrashItem[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
