/**
 * Sanitizes a string to be a valid rate input.
 * - Allows up to 3 digits for the integer part.
 * - Allows up to 4 digits for the decimal part.
 * - Removes any non-digit or non-dot characters.
 * @param v The input string.
 * @returns The sanitized string.
 */
export function sanitizeRateOfferedInput(v: string): string {
  if (!v) return '';
  // Remove everything except digits and dot
  let s = v.replace(/[^\d.]/g, '');
  
  // Ensure only one dot
  const parts = s.split('.');
  if (parts.length > 2) {
    s = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  
  const [intPart, decPart] = s.split('.');

  const sanitizedInt = (intPart || '').slice(0, 3);
  const sanitizedDec = (decPart || '').slice(0, 4);

  return decPart !== undefined ? `${sanitizedInt}.${sanitizedDec}` : sanitizedInt;
}
