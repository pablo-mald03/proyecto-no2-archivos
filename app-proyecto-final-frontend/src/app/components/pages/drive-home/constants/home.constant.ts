import { RecentSortBy, SortDirection } from "../../../../features/files/models/request/recent-files-params.model";

//Pagination size
export const PAGE_SIZE = 20;
export const DEFAULT_SORT: RecentSortBy = 'updatedAt';
export const DEFAULT_DIRECTION: SortDirection = 'desc';