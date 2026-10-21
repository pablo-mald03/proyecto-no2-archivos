import { TrashItemType } from "../../constants/trash.constants";

/*Trash item response model representation */
export interface TrashItem {
  id: string;
  name: string;
  type: TrashItemType;
  trashBatchId: string;
  deletedAt: string;
  sizeBytes?: number;
  extension?: string;
}
