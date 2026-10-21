import { TopUserByFileCountResponse } from "../../../../features/report-users/models/response/top-user-by-file-count-response.model";
import { TopUserByStorageResponse } from "../../../../features/report-users/models/response/top-user-by-storage-response.model";
import { PodiumEntry } from "../types/podium-entry.model";
import { formatBytes } from "./format-bytes.util";
import { calculateUsagePercent } from "./storage-usage.util";


//Maps a top user by file count into a podium entry
export function toPodiumEntryByFileCount(user: TopUserByFileCountResponse): PodiumEntry {
  return {
    id: user.userId,
    name: user.fullName,
    username: user.username,
    email: user.email,
    value: user.fileCount,
    valueLabel: String(user.fileCount)
  };
}

//Maps a top user by storage used into a podium entry
export function toPodiumEntryByStorage(user: TopUserByStorageResponse): PodiumEntry {
  return {
    id: user.userId,
    name: user.fullName,
    username: user.username,
    email: user.email,
    value: user.usedBytes,
    valueLabel: formatBytes(user.usedBytes),
    secondaryLabel: `de ${formatBytes(user.quotaBytes)}`,
    progress: calculateUsagePercent(user.usedBytes, user.quotaBytes)
  };
}
