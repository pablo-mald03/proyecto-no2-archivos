/*Query parameters for listing shared-with-me items with server-side pagination and filters */
export interface SharedWithMeQueryParams {
  page?: number;
  size?: number;
  direction?: 'asc' | 'desc';
  sortBy?: string;
  search?: string;
  type?: 'FILE' | 'FOLDER';
  extension?: string;
  access?: 'VIEWER' | 'COMMENTER' | 'EDITOR';
  from?: string;
  to?: string;
}
