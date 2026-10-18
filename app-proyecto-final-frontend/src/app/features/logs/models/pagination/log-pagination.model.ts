import { Log } from "../log.model";

/*Principal log pageable interface representation */
export interface LogPage {
  content: Log[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}