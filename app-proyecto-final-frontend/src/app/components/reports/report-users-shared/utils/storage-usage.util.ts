import { StorageUsageLevel } from "../types/storage-usage-level.model";

export const STORAGE_WARNING_THRESHOLD = 70;
export const STORAGE_CRITICAL_THRESHOLD = 90;

//Percentage of the quota consumed (0 when the user has no quota)
export function calculateUsagePercent(usedBytes: number, quotaBytes: number): number {
  return quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;
}

//Level of the usage according to the thresholds
export function getStorageUsageLevel(percent: number): StorageUsageLevel {
  if (percent >= STORAGE_CRITICAL_THRESHOLD) return 'critical';
  if (percent >= STORAGE_WARNING_THRESHOLD) return 'warning';
  return 'ok';
}
