/**
 * Sanitizes a string to be a valid rate input.
 * - Allows up to 3 digits for the integer part.
 * - Allows up to 4 digits for the decimal part.
 * - Removes any non-digit or non-dot characters.
 * @param v The input string.
 * @returns The sanitized string.
 */
export function sanitizeRateOfferedInput(v: string): string {
  if (v === null || v === undefined) return '';

  let value = v.toString();

  // Remove any characters that are not digits or a dot
  value = value.replace(/[^\d.]/g, "");

  // If there are multiple dots, keep only the first one
  const parts = value.split('.');
  if (parts.length > 2) {
    value = `${parts[0]}.${parts.slice(1).join('')}`;
  }

  const [integerPart, decimalPart] = value.split('.');

  // Constrain integer part to 3 digits
  const sanitizedInteger = integerPart.slice(0, 3);

  if (decimalPart !== undefined) {
    // Constrain decimal part to 4 digits
    const sanitizedDecimal = decimalPart.slice(0, 4);
    return `${sanitizedInteger}.${sanitizedDecimal}`;
  }

  return sanitizedInteger;
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
