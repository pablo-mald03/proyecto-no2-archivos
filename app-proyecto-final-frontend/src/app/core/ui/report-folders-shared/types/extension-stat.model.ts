/* View model of the files grouped by extension */
export interface ExtensionStat {
  extension: string;
  count: number;
  bytes: number;
  percent: number;
  color: string;
}
