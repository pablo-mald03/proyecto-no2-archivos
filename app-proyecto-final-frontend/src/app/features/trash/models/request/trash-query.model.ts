/*Query parameters for listing trash items request model*/
export interface TrashQueryParams {
  page?: number;
  size?: number;
  direction?: 'asc' | 'desc';
  sortBy?: string;
  search?: string;
  type?: 'FILE' | 'FOLDER';
  extension?: string;
  from?: string;
  to?: string;
}
