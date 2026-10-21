import { UserRootFolderSpaceResponse } from "../../../../features/report-folders/models/response/user-root-folder-space-response.model";
import { SpaceSlice } from "../types/space-slice.model";
import { paletteColor } from "./space-palette.util";


//Maps the root folders into slices with their share of the total space
export function buildSpaceSlices(folders: UserRootFolderSpaceResponse[]): SpaceSlice[] {
  const total = folders.reduce((acc, folder) => acc + folder.totalSizeBytes, 0);

  return folders.map((folder, index) => ({
    id: folder.folderId,
    name: folder.folderName,
    bytes: folder.totalSizeBytes,
    fileCount: folder.fileCount,
    percent: total > 0 ? (folder.totalSizeBytes / total) * 100 : 0,
    color: paletteColor(index)
  }));
}
