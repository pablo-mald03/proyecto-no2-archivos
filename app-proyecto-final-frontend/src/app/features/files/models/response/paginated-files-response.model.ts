import { FileResponse } from "./file-response.model";

//Paginated files response model
export interface PaginatedFilesResponse {
  content: FileResponse[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
