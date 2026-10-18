/*
* Principal model for user query pagination requests
*/
export interface UserQuery {
  page?: number;
  size?: number;
  sortBy?: 'username' | 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt';
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  roleCode?: string;
}