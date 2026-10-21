/* Query parameters interface for shares reports */
export interface ReportSharesQueryParams {
    page?: number;
    size?: number;
    direction?: 'asc' | 'desc';
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    resourceType?: 'FILE' | 'FOLDER';
}