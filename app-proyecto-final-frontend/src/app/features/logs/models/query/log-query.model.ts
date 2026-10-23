
/*Principal log query model */
export interface LogQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  from?: string;
  to?: string;
}