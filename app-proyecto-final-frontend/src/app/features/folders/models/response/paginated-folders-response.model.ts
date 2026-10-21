import { FolderResponse } from "./folder-response.model";

/*Paginated folders response model */
export interface PaginatedFoldersResponse {
  content: FolderResponse[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
