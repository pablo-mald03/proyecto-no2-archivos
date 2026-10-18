/*Create role request */
export interface CreateRoleRequest {
    code: string;
    name: string;
    description: string;
    permissions: string[];
}