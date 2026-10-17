
//Settings key model
export const SettingKey = {
  STORAGE_DEFAULT_QUOTA_BYTES: 'storage.defaultQuotaBytes',
  USERS_DEFAULT_ROLE_CODE: 'users.defaultRoleCode',
} as const;


export type SettingKey = (typeof SettingKey)[keyof typeof SettingKey];