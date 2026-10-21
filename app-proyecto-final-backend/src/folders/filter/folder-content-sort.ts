
//Principal folder content sort fields 
export const FOLDER_CONTENT_SORT_FIELDS = [
  'name',
  'createdAt',
  'updatedAt',
  'sizeBytes',
] as const;

//principal content sort field
export type FolderContentSortField = (typeof FOLDER_CONTENT_SORT_FIELDS)[number];
