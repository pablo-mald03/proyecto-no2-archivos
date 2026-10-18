export const AccessLevel = {
  VIEWER: 'VIEWER',
  COMMENTER: 'COMMENTER',
  EDITOR: 'EDITOR',
} as const;

export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

export const ACCESS_LEVEL_RANK: Record<AccessLevel, number> = {
  VIEWER: 1,
  COMMENTER: 2,
  EDITOR: 3,
};

export const GranteeType = {
  USER: 'USER',
  ANY_USER: 'ANY_USER',
} as const;

export type GranteeType = (typeof GranteeType)[keyof typeof GranteeType];
