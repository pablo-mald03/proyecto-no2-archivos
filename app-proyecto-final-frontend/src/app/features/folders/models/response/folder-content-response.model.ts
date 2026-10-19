import { FolderResponse } from "./folder-response.model";
import { FolderBreadcrumb } from "./folder-breadcrumb.model";
import { FileResponse } from "../../../files/models/response/file-response.model";

/*Folder content response model representation */
export interface FolderContentResponse {
  currentFolder: FolderResponse | null;
  breadcrumbs: FolderBreadcrumb[];
  folders: FolderResponse[];
  files: FileResponse[];
}
