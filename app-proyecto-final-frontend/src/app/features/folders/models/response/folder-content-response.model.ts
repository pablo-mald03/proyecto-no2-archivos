import { FolderResponse } from "./folder-response.model";
import { FolderBreadcrumb } from "./folder-breadcrumb.model";
import { PaginatedFilesResponse } from "../../../files/models/response/paginated-files-response.model";
import { PaginatedFoldersResponse } from "./paginated-folders-response.model";

/*Folder content response model representation */
export interface FolderContentResponse {
  currentFolder: FolderResponse | null;
  breadcrumbs: FolderBreadcrumb[];
  folders: PaginatedFoldersResponse;
  files: PaginatedFilesResponse;
}
