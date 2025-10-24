import { DISPLAY_CONFIG, VALIDATION_CONFIG } from './constants';

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

  // Constrain integer part to configured digits
  const sanitizedInteger = integerPart.slice(0, DISPLAY_CONFIG.INPUT_LIMITS.RATE_INTEGER_DIGITS);

  if (decimalPart !== undefined) {
    // Constrain decimal part to configured digits
    const sanitizedDecimal = decimalPart.slice(0, DISPLAY_CONFIG.INPUT_LIMITS.RATE_DECIMAL_DIGITS);
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

/**
 * Sanitizes percentage input for platform fee
 * @param v The input string
 * @returns Sanitized percentage string
 */
export function sanitizePercentageInput(v: string): string {
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

  // Constrain integer part to 2 digits for percentage
  const sanitizedInteger = integerPart.slice(0, 2);

  if (decimalPart !== undefined) {
    // Constrain decimal part to 2 digits for percentage
    const sanitizedDecimal = decimalPart.slice(0, DISPLAY_CONFIG.DECIMAL_PLACES.PERCENTAGE);
    return `${sanitizedInteger}.${sanitizedDecimal}`;
  }

  return sanitizedInteger;
}

/**
 * Validates if input matches the expected pattern
 * @param input Input string to validate
 * @param type Type of validation ('rate', 'amount', 'percentage')
 * @returns boolean indicating if input is valid
 */
export function validateInputFormat(input: string, type: 'rate' | 'amount' | 'percentage'): boolean {
  const patterns = {
    rate: VALIDATION_CONFIG.PATTERNS.RATE,
    amount: VALIDATION_CONFIG.PATTERNS.USD_AMOUNT,
    percentage: VALIDATION_CONFIG.PATTERNS.PERCENTAGE,
  };

  return patterns[type].test(input);
}

/**
 * Sanitizes USD amount input
 * @param v The input string
 * @returns Sanitized USD amount string
 */
export function sanitizeUsdAmountInput(v: string): string {
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

  // Constrain integer part to 6 digits for USD amount
  const sanitizedInteger = integerPart.slice(0, 6);

  if (decimalPart !== undefined) {
    // Constrain decimal part to 2 digits for currency
    const sanitizedDecimal = decimalPart.slice(0, DISPLAY_CONFIG.DECIMAL_PLACES.CURRENCY);
    return `${sanitizedInteger}.${sanitizedDecimal}`;
  }

  return sanitizedInteger;
}
