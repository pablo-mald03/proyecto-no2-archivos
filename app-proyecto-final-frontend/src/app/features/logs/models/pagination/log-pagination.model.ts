import { Log } from "../log.model";

/*Principal log pageable interface representation */
export interface LogPage {
    logs: Log[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}