export interface ChangeSelfPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmationPassword?: string;
}