/*Principal folder response dto model */
export class FolderResponseDto {
  id!: string;
  ownerId!: string;
  parentId!: string | null;
  name!: string;
  ancestors!: string[];
  createdAt!: string;
  updatedAt!: string;
}
