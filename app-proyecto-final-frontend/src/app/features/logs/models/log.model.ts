
/*Principal log interface base representation */
export interface Log {
    id: number;
    module: string;
    action: string;
    detail: string;
    userId: string;
    userRegistry: string;
    userIdentification: string;
    createdAt: string;
}