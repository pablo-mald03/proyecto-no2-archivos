/*Principal trash item response dto*/
export class TrashItemDto {
  id!: string;
  name!: string;
  type!: 'FILE' | 'FOLDER';
  trashBatchId!: string;
  deletedAt!: string;
  sizeBytes?: number;
  extension?: string;
}
