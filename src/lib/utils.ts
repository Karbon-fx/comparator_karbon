import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DISPLAY_CONFIG, VALIDATION_CONFIG } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToLogScale(value: number): number {
  return Math.log10(Math.max(100, value));
}

export function convertFromLogScale(logValue: number): number {
  return Math.round(Math.pow(10, logValue));
}

/**
 * Safely converts a value to a number, returning NaN for invalid inputs.
 * @param v - The value to convert.
 * @returns A number or NaN.
 */
export function toNumberSafe(v: unknown): number {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Formats a number as a rate string with configurable decimal places.
 * @param v - The number to format.
 * @param decimalPlaces - Number of decimal places (default from config)
 * @returns A formatted string or '—'.
 */
export function formatRate(
  v: number | null | undefined, 
  decimalPlaces: number = DISPLAY_CONFIG.DECIMAL_PLACES.RATE
): string {
  const n = toNumberSafe(v);
  if (isNaN(n)) {
    return '—';
  }
  return n.toFixed(decimalPlaces);
}

/**
 * Formats a number as an INR currency string.
 * @param amount - The number to format.
 * @returns A formatted currency string or '—'.
 */
export function formatAsINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || !Number.isFinite(amount)) {
    return "—";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: DISPLAY_CONFIG.DECIMAL_PLACES.CURRENCY,
    maximumFractionDigits: DISPLAY_CONFIG.DECIMAL_PLACES.CURRENCY,
  }).format(amount);
}

/**
 * Formats a number as a USD currency string.
 * @param amount - The number to format.
 * @returns A formatted currency string or '$0.00'.
 */
export function formatAsUSD(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || !Number.isFinite(amount)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: DISPLAY_CONFIG.DECIMAL_PLACES.CURRENCY,
    maximumFractionDigits: DISPLAY_CONFIG.DECIMAL_PLACES.CURRENCY,
  }).format(amount);
}

/**
 * Calculates the per-USD markup in INR.
 * Positive value means the provider's rate is worse than live rate.
 * Zero or negative means at or better than live rate.
 * 
 * @param liveRate - The mid-market live exchange rate (INR per USD)
 * @param offeredRate - The provider's offered rate (INR per USD)
 * @returns Markup per USD in INR
 */
export function calculateMarkupPerUsd(liveRate: number, offeredRate: number): number {
  if (isNaN(liveRate) || isNaN(offeredRate) || liveRate <= 0 || offeredRate <= 0) {
    return NaN;
  }
  return liveRate - offeredRate;
}

/**
 * Calculates the total markup amount for the entire transaction.
 * 
 * @param markupPerUsd - Markup per USD in INR
 * @param usdAmount - Total USD amount being converted
 * @returns Total markup in INR
 */
export function calculateTotalMarkup(markupPerUsd: number, usdAmount: number): number {
  if (isNaN(markupPerUsd) || isNaN(usdAmount)) {
    return NaN;
  }
  return markupPerUsd * usdAmount;
}

/**
 * Calculates the total amount in INR received for a given USD amount and exchange rate.
 * Returns NaN if inputs are invalid.
 * @param usdAmount - The amount in USD to be converted.
 * @param offeredRate - The exchange rate offered by the provider.
 * @returns The total amount in INR or NaN.
 */
export function calculateTotalInr(usdAmount: number, offeredRate: number): number {
  if (isNaN(usdAmount) || isNaN(offeredRate) || usdAmount < 0 || offeredRate < 0) {
    return NaN;
  }
  return usdAmount * offeredRate;
}

/**
 * Calculates the savings achieved by using Karbon compared to another provider.
 * Returns NaN if inputs are invalid.
 * @param karbonTotalInr - The total INR received if using Karbon.
 * @param providerTotalInr - The total INR received if using the other provider.
 * @returns The savings amount in INR or NaN.
 */
export function calculateSavings(karbonTotalInr: number, providerTotalInr: number): number {
  if (isNaN(karbonTotalInr) || isNaN(providerTotalInr)) {
    return NaN;
  }
  return karbonTotalInr - providerTotalInr;
}

/**
 * Formats a number with thousand separators
 * @param num - Number to format
 * @returns Formatted string with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Validates if a value is within specified bounds
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns boolean indicating if value is valid
 */
export function isWithinBounds(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}

/**
 * Clamps a number between min and max values
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validates input against a regex pattern
 * @param input - Input string to validate
 * @param pattern - Regex pattern to test against
 * @returns boolean indicating if input matches pattern
 */
export function validateInput(input: string, pattern: RegExp): boolean {
  return pattern.test(input);
}

/**
 * Debounce function for limiting function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
