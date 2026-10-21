import { SharedWithMeItem } from './shared-with-me-item.model';

/*Paginated response wrapper for shared-with-me items request model*/
export interface PaginatedSharedWithMeResponse {
  content: SharedWithMeItem[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
