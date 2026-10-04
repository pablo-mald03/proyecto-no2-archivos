
// Ajusta los valores a los roleCode reales que devuelve tu API
export const ROLES = { ADMIN: 'ADMIN', USER: 'USER' } as const;

// Home de cada rol. Si no quieres renombrar tu ruta actual, pon ADMIN: '/dashboard'
export const ROLE_HOME: Record<string, string> = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.USER]: '/drive',
};

export const homeFor = (roleCode: string): string => ROLE_HOME[roleCode] ?? '/drive';
