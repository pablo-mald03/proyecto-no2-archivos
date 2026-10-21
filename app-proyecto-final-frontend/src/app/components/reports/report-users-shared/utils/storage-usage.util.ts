import { StorageUsageLevel } from "../types/storage-usage-level.model";

export const STORAGE_WARNING_THRESHOLD = 70;
export const STORAGE_CRITICAL_THRESHOLD = 90;

// Percentage of the quota consumed with precision control (default 2 decimals)
export function calculateUsagePercent(
  usedBytes: number, 
  quotaBytes: number, 
  decimals: number = 2
): number {
  if (quotaBytes <= 0) return 0;
  const percent = (usedBytes / quotaBytes) * 100;
  return Number(percent.toFixed(decimals));
}

// Level of the usage according to the thresholds
export function getStorageUsageLevel(percent: number): StorageUsageLevel {
  if (percent >= STORAGE_CRITICAL_THRESHOLD) return 'critical';
  if (percent >= STORAGE_WARNING_THRESHOLD) return 'warning';
  return 'ok';
}