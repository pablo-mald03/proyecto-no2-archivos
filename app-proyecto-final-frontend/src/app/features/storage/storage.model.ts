
//Storage usage model
export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
}

//Storage level model
export type StorageLevel = 'ok' | 'warn' | 'full';