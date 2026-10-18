
/*Principal sanitization code function */
export function sanitizeCode(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')        
    .replace(/[^A-Z0-9_]/g, '');  
}