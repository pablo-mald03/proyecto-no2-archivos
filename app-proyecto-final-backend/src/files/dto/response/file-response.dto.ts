export class FileResponseDto {
  id!: string;
  ownerId!: string;
  folderId!: string | null;
  name!: string;
  extension!: 'txt' | 'md';
  mimeType!: string;
  sizeBytes!: number;
  createdAt!: string;
  updatedAt!: string;
}
