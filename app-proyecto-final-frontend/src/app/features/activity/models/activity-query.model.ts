//Activity query model
export interface ActivityQuery {
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'action' | 'actorUsername';
  direction?: 'asc' | 'desc';
  action?: string;
  resourceType?: string;
  resourceId?: string;
  from?: string;
  to?: string;
}