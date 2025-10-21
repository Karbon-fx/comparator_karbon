/**
 * Calculates the markup between the live rate and the rate offered by a provider.
 * @param liveRate - The current market exchange rate.
 * @param offeredRate - The exchange rate offered by the provider.
 * @returns The markup value.
 */
export function calculateMarkup(liveRate: number, offeredRate: number): number {
  if (liveRate <= 0 || offeredRate <= 0) {
    return 0;
  }
  return liveRate - offeredRate;
}

/**
 * Calculates the total amount in INR received for a given USD amount and exchange rate.
 * @param usdAmount - The amount in USD to be converted.
 * @param offeredRate - The exchange rate offered by the provider.
 * @returns The total amount in INR.
 */
export function calculateTotalInr(usdAmount: number, offeredRate: number): number {
  if (usdAmount <= 0 || offeredRate <= 0) {
    return 0;
  }
  return usdAmount * offeredRate;
}

/**
 * Calculates the savings achieved by using Karbon compared to another provider.
 * @param karbonTotalInr - The total INR received if using Karbon.
 * @param providerTotalInr - The total INR received if using the other provider.
 * @returns The savings amount in INR.
 */
export function calculateSavings(karbonTotalInr: number, providerTotalInr: number): number {
  return karbonTotalInr - providerTotalInr;
}
