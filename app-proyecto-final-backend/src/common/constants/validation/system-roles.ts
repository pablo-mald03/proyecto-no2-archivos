//Principal business roles
export const SystemRole = {
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

//System role constant
export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];