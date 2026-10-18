/*
* Principal model for role query pagination requests
*/
export interface RoleQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  isActive?: boolean;
}