/* Metadata associated with specific activity actions model */
export interface LogMetadata {
  previousName?: string;
  fromFolderId?: string;
  toFolderId?: string;
  accessLevel?: string;
  previousAccessLevel?: string;
  granteeType?: string;
  sizeBytes?: number;
  previousSizeBytes?: number;
}