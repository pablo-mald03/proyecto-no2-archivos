
/*Role edit model interface */
export interface RoleEdit {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  permissionsCount: number;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
}