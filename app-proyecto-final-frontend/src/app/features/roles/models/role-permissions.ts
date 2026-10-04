import { Permission } from "../../permissions/models/permission.model";

/*Principal role permissions request */
export interface RolePermissions {
    id: number;
    alias: string;
    name: string;
    description: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}