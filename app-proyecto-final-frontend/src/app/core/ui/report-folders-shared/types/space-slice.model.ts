/* View model of one slice of the space used by the root folders */
export interface SpaceSlice {
  id: string;
  name: string;
  bytes: number;
  fileCount: number;
  percent: number;
  color: string;
}
