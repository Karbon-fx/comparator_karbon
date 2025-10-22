
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
 * Formats a number as a rate string with 4 decimal places.
 * @param v - The number to format.
 * @returns A formatted string or '—'.
 */
export function formatRate(v: number | null | undefined): string {
    const n = toNumberSafe(v);
    if (isNaN(n)) {
        return '—';
    }
    return n.toFixed(4);
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as a USD currency string.
 * @param amount - The number to format.
 * @returns A formatted currency string or '—'.
 */
export function formatAsUSD(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || !Number.isFinite(amount)) {
      return "$0.00";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
