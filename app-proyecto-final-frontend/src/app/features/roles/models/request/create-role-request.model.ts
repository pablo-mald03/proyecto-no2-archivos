/*Create role request */
export interface CreateRoleRequest {
    alias: string;
    name: string;
    description: string;
    permissionIds: number[];
}