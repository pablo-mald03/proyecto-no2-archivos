
/*Principal log query model */
export interface LogQuery {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    module?: string;
    createdFrom?: string;
    createdTo?: string;
}