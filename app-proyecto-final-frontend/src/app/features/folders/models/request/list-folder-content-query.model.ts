/*Query parameters for listing folder content */
export interface ListFolderContentQueryParams {
  page?: number;
  size?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'sizeBytes';
  direction?: 'asc' | 'desc';
  search?: string;
  type?: 'ALL' | 'FOLDERS_ONLY' | 'FILES_ONLY';
  extension?: 'txt' | 'md';
}
