///Principal grantee type representation
export const GranteeType = {
  USER: 'USER',
  ANY_USER: 'ANY_USER',
} as const;

//Principal grantee type model
export type GranteeType = (typeof GranteeType)[keyof typeof GranteeType];
