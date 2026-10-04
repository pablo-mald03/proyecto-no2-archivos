import { Permission } from "./permission.model";

//Principal permission pagination response
export interface PermissionPage {
    permissions: Permission[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}