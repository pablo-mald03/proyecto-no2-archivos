
/*Register user request model */
export interface RegisterUserRequest {
  identification: string;
  name: string;
  firstName: string;
  userRegistry: string;
  phoneNumber: string;
  rawPassword: string;
  birthDate: string;
  email: string;
  roleAliases: string[];
}