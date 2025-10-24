/**
 * Custom hook for handling all financial calculations
 */

import { useMemo, useCallback, useState } from 'react';
import { 
  calculateTotalInr, 
  calculateMarkupPerUsd, 
  calculateSavings,
  isWithinBounds 
} from '@/lib/utils';
import { CURRENCY_LIMITS, DEFAULT_RATES } from '@/lib/constants';
import type { 
  UseCalculationsResult, 
  CalculationResult, 
  TransactionSummary, 
  CompetitorData,
  PlatformFee,
  ExchangeRateData 
} from '@/types';

interface UseCalculationsOptions {
  liveRate: ExchangeRateData | null;
  initialAmount?: number;
  initialPlatformFee?: number;
}

export const useCalculations = ({
  liveRate,
  initialAmount = CURRENCY_LIMITS.USD.DEFAULT,
  initialPlatformFee = CURRENCY_LIMITS.PLATFORM_FEE.DEFAULT,
}: UseCalculationsOptions): UseCalculationsResult => {
  const [usdAmount, setUsdAmount] = useState(initialAmount);
  const [platformFeePercent, setPlatformFeePercent] = useState(initialPlatformFee);
  const [competitorRates, setCompetitorRates] = useState({
    bank: DEFAULT_RATES.BANK,
    paypal: DEFAULT_RATES.PAYPAL,
  });

  const updateAmount = useCallback((amount: number) => {
    const clampedAmount = Math.max(
      CURRENCY_LIMITS.USD.MIN,
      Math.min(CURRENCY_LIMITS.USD.MAX, amount)
    );
    setUsdAmount(clampedAmount);
  }, []);

  const updateRate = useCallback((provider: string, rate: number) => {
    if (provider === 'bank' || provider === 'paypal') {
      setCompetitorRates(prev => ({
        ...prev,
        [provider]: rate,
      }));
    }
  }, []);

  const updatePlatformFee = useCallback((percentage: number) => {
    const clampedFee = Math.max(
      CURRENCY_LIMITS.PLATFORM_FEE.MIN,
      Math.min(CURRENCY_LIMITS.PLATFORM_FEE.MAX, percentage)
    );
    setPlatformFeePercent(clampedFee);
  }, []);

  // Calculate platform fee details
  const platformFee: PlatformFee = useMemo(() => {
    const rate = liveRate?.rate || DEFAULT_RATES.LIVE_RATE_FALLBACK;
    const grossAmount = calculateTotalInr(usdAmount, rate);
    const feeAmount = (grossAmount * platformFeePercent) / 100;

    return {
      percentage: platformFeePercent,
      amount: feeAmount,
      description: `${platformFeePercent}% Platform Fee`,
    };
  }, [liveRate, usdAmount, platformFeePercent]);

  // Calculate Karbon totals
  const karbonCalculation: CalculationResult = useMemo(() => {
    const rate = liveRate?.rate || DEFAULT_RATES.LIVE_RATE_FALLBACK;
    const grossInr = calculateTotalInr(usdAmount, rate);
    const netInr = grossInr - platformFee.amount;

    return {
      totalInr: netInr,
      markupPerUsd: 0, // Karbon has zero markup
      totalMarkup: 0,
      savings: 0, // Baseline for comparison
      isValid: !isNaN(grossInr) && !isNaN(netInr),
    };
  }, [liveRate, usdAmount, platformFee.amount]);

  // Calculate competitor data
  const competitorComparison: CompetitorData[] = useMemo(() => {
    const rate = liveRate?.rate || DEFAULT_RATES.LIVE_RATE_FALLBACK;
    
    return Object.entries(competitorRates).map(([name, competitorRate]) => {
      const totalAmount = calculateTotalInr(usdAmount, competitorRate);
      const markupPerUsd = calculateMarkupPerUsd(rate, competitorRate);
      const savings = calculateSavings(karbonCalculation.totalInr, totalAmount);

      return {
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize name
        rate: competitorRate,
        markup: markupPerUsd,
        totalAmount,
        savings,
      };
    });
  }, [liveRate, usdAmount, competitorRates, karbonCalculation.totalInr]);

  // Create transaction summary
  const summary: TransactionSummary = useMemo(() => {
    const rate = liveRate?.rate || DEFAULT_RATES.LIVE_RATE_FALLBACK;
    const grossInr = calculateTotalInr(usdAmount, rate);

    return {
      usdAmount,
      exchangeRate: rate,
      grossInr,
      platformFee,
      netInr: karbonCalculation.totalInr,
      competitorComparison,
    };
  }, [usdAmount, liveRate, platformFee, karbonCalculation.totalInr, competitorComparison]);

  // Main calculation result
  const calculations: CalculationResult = useMemo(() => ({
    ...karbonCalculation,
    isValid: karbonCalculation.isValid && 
             isWithinBounds(usdAmount, CURRENCY_LIMITS.USD.MIN, CURRENCY_LIMITS.USD.MAX),
  }), [karbonCalculation, usdAmount]);

  return {
    calculations,
    summary,
    updateAmount,
    updateRate,
    updatePlatformFee,
  };
};
