const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

//Formats a bytes amount into a human readable string
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';

  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : decimals)} ${BYTE_UNITS[index]}`;
}
