/*Principal permission query */
export interface PermissionQuery {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'ASC' | 'DESC';
    module?: string;
    action?: string;
}