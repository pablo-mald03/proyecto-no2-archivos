import { Role } from "../../../roles/models/role.model";

/*User role assignment model */
export interface UserRoleAssignment {
    userId: string;
    userRegistry: string;
    identification: string;
    email: string;
    roles: Role[];
}