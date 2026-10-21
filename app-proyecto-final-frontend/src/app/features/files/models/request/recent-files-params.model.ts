export type RecentSortBy = 'updatedAt' | 'createdAt' | 'name' | 'sizeBytes';
export type SortDirection = 'asc' | 'desc';
 
/* Query params de model */
export interface RecentFilesParams {
  page: number;              
  size: number;          
  direction: SortDirection;
  sortBy?: RecentSortBy;
  search?: string;
  extension?: 'txt' | 'md';
  from?: string;             
  to?: string;             
}
 
