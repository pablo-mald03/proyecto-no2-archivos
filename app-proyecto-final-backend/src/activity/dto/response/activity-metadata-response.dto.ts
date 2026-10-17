
//Activity metadata response dto model
export class ActivityMetadataResponseDto {
  previousName?: string;
  fromFolderId?: string | null;  
  toFolderId?: string | null;
  accessLevel?: string;
  previousAccessLevel?: string;
  granteeType?: string;
  sizeBytes?: number;
  previousSizeBytes?: number;
}