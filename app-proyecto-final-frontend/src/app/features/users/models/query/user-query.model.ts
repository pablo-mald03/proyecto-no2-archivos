/*
* Principal model for user query pagination requests
*/
export interface UserQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}