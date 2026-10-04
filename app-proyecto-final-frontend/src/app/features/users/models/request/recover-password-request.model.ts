/*Recover password request interface */
export interface RecoverPasswordRequest {
  dpi: string;
  email: string;
  password: string;
  confirmationPassword: string;
}