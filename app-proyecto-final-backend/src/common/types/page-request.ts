
/*Principal page request model */
export interface PageRequest {
  page: number;
  size: number;
  sortBy: string;
  direction: 'asc' | 'desc';
}