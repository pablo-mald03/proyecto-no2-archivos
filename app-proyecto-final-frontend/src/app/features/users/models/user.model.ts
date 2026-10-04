import { Role } from "../../roles/models/role.model";


/**
 * Principal user model representation
 * 
*/
export interface User {

    id: string;
    identification: string;
    name: string;
    firstName: string;
    phoneNumber: string;
    userRegistry: string;
    birthDate: string;
    email: string;
    status: boolean;
    roles: Role[];
}