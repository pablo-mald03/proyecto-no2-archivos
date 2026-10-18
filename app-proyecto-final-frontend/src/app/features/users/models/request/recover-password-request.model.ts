/*Recover password request interface */
export interface RecoverPasswordRequest {
  username: string;
  email: string;
  password: string;
  confirmationPassword: string;
}