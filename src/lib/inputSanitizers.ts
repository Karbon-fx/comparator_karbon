/**
 * Sanitizes a string to be a valid rate input.
 * - Allows up to 2 digits for the integer part.
 * - Allows up to 4 digits for the decimal part.
 * - Removes any non-digit or non-dot characters.
 * @param v The input string.
 * @returns The sanitized string.
 */
export function sanitizeRateOfferedInput(v: string): string {
  if (v === null || v === undefined) return '';

  // 1. Remove non-numeric characters except for the first dot
  let s = v.toString().replace(/[^\d.]/g, '');
  const parts = s.split('.');
  if (parts.length > 2) {
    s = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  
  const [intPart, decPart] = s.split('.');

  // 2. Sanitize integer part (max 2 digits)
  const sanitizedInt = (intPart || '').slice(0, 2);
  
  // 3. If a decimal part exists, sanitize it (max 4 digits) and combine
  if (decPart !== undefined) {
    const sanitizedDec = decPart.slice(0, 4);
    return `${sanitizedInt}.${sanitizedDec}`;
  }
  
  // 4. If there's no decimal part, just return the sanitized integer
  return sanitizedInt;
}

/**
 * Sanitizes and parses a USD display string.
 * It formats the number with commas for display and returns the raw numeric value.
 * @param v The display string, which may contain commas.
 * @returns An object with the cleaned display string (with commas) and the parsed numeric value.
 */
export function sanitizeUsdDisplay(v: string): { display: string; numeric: number } {
    if (v === '') return { display: '', numeric: 0 };
    const numeric = Number(v.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(numeric)) {
        return { display: '', numeric: 0 };
    }
    const display = new Intl.NumberFormat('en-US').format(numeric);
    return { display, numeric };
}
