import { Role } from "../../roles/models/role.model";
import { UserStorage } from "./response/user-storage.response.model";


/**
 * Principal user model representation
 * 
*/
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleCode: string;
  roleName: string;
  storage: UserStorage;
  lastLoginAt: string | null;
  createdAt: string;
}