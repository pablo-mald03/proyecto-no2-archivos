
/*Principal log query model */
export interface LogQuery {
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'action' | 'actorUsername';
  direction?: 'asc' | 'desc';
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  from?: string;
  to?: string;
}