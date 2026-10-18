import { UserStorage } from "./user-storage.response.model";

/*Principal user profile */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleCode: string;
  roleName: string;
  permissions: string[];
  storage: UserStorage;
  deactivatedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}