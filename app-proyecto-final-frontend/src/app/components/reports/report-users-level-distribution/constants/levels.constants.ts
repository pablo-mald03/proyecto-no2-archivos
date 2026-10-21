import { StorageUsageLevel } from "../../report-users-shared/types/storage-usage-level.model";
import { STORAGE_CRITICAL_THRESHOLD, STORAGE_WARNING_THRESHOLD } from "../../report-users-shared/utils/storage-usage.util";

//Order and range label of each level
export const LEVELS: { level: StorageUsageLevel; range: string }[] = [
  { level: 'ok', range: `< ${STORAGE_WARNING_THRESHOLD}%` },
  { level: 'warning', range: `${STORAGE_WARNING_THRESHOLD}% - ${STORAGE_CRITICAL_THRESHOLD}%` },
  { level: 'critical', range: `≥ ${STORAGE_CRITICAL_THRESHOLD}%` }
];