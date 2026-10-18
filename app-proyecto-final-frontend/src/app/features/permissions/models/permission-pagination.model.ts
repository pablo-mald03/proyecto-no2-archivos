import { Permission } from "./permission.model";

//Principal permission pagination response
export interface PermissionPage {
    content: Permission[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}