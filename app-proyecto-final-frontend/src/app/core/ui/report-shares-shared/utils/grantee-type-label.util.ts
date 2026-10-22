//Readable label of the grantee type 
export function getGranteeTypeLabel(granteeType: string): string {
  return granteeType?.toUpperCase() === 'USER' ? 'Usuario' : granteeType;
}
