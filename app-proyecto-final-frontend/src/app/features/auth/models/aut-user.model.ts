/* Auth user interface model*/
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleCode: string;
  permissions: string[];
}