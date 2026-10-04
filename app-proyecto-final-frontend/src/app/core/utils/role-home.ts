import { ROLES } from '../constants/roles';

const ROLE_HOME: Record<string, string> = {
  [ROLES.USER]: '/drive',
};

const DEFAULT_HOME = '/dashboard';

//Principal function to redirect at the expected url by role
export const homeFor = (roleCode: string | undefined): string =>
  roleCode ? (ROLE_HOME[roleCode] ?? DEFAULT_HOME) : '/auth/login';