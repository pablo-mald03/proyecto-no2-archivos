/*Principal model for settings*/
export interface SystemSetting {
  key: string;
  label: string;
  category: 'STORAGE' | 'USERS' | 'SYSTEM';
  value: string | number;
  description: string;
  updatedBy: string | null;
  updatedAt: string;
}