/*Principal model for settings*/

export interface SystemSetting {
  key: string;
  value: string | number;
  description: string;
  updatedBy: string | null;
  updatedAt: string;
}