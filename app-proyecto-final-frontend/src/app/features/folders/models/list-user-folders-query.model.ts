/*Query parameters for listing folders of a user */
export interface ListUserFoldersQueryParams {
    userId: string;
    page?: number;
    size?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt';
    direction?: 'asc' | 'desc';
    search?: string;
}