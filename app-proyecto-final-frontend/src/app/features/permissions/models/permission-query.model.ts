/*Principal permission query */
export interface PermissionQuery {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'asc' | 'desc';
    module?: string;
    search?: string;
}