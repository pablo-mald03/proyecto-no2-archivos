
//Principal constant for the access level restrinction
export const AccessLevel = {
  VIEWER: 'VIEWER',
  COMMENTER: 'COMMENTER',
  EDITOR: 'EDITOR',
} as const;

//Access level type
export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

//Access level rank model
export const ACCESS_LEVEL_RANK: Record<AccessLevel, number> = {
  VIEWER: 1,
  COMMENTER: 2,
  EDITOR: 3,
};
