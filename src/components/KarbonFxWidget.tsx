/**
 * Refactored Karbon FX Widget - Main component using hooks and smaller components
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CurrencyInputSection } from '@/components/CurrencyInputSection';
import { KarbonCard } from '@/components/KarbonCard';
import { CompetitorCard } from '@/components/CompetitorCard';
import { BankIcon, PayPalIcon } from '@/components/icons';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useCalculations } from '@/hooks/useCalculations';
import { useValidation } from '@/hooks/useValidation';
import { CURRENCY_LIMITS, API_CONFIG } from '@/lib/constants';
import { trackFeeComparison } from '@/lib/clarity';
import type { KarbonFxWidgetProps } from '@/types';

const KarbonFxWidgetSkeleton = () => (
  <div className="karbon-fx-widget w-full max-w-5xl mx-auto bg-transparent overflow-hidden animate-pulse">
    <div className="pt-4 pb-4">
      <div className="mb-4">
        <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
        <div className="h-20 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-stretch">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`p-6 rounded-2xl ${i === 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </div>
          <div className="mb-6 pb-6 border-b border-gray-300">
            <div className="h-4 w-20 bg-gray-300 rounded mb-2"></div>
            <div className="h-10 w-32 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-gray-300 rounded"></div>
              <div className="h-8 w-20 bg-gray-300 rounded"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-20 bg-gray-300 rounded"></div>
              <div className="h-5 w-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const KarbonFxWidgetInner: React.FC<KarbonFxWidgetProps> = ({
  initialAmount = CURRENCY_LIMITS.USD.DEFAULT,
  compact = false,
  onAmountChange,
  onRateUpdate,
  className = '',
}) => {
  const [isClient, setIsClient] = useState(false);
  const [platformFeePercent, setPlatformFeePercent] = useState(
    CURRENCY_LIMITS.PLATFORM_FEE.DEFAULT.toString()
  );
  const [bankCharges, setBankCharges] = useState(0); // Add bank charges state

  // Custom hooks
  const { rate: liveRate, loading, error } = useExchangeRate(true);
  const { calculations, summary, updateAmount, updateRate, updatePlatformFee } = useCalculations({
    liveRate,
    initialAmount,
    initialPlatformFee: CURRENCY_LIMITS.PLATFORM_FEE.DEFAULT,
  });
  const { getErrorMessage } = useValidation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    onAmountChange?.(summary.usdAmount);
  }, [summary.usdAmount, onAmountChange]);

  useEffect(() => {
    if (liveRate) {
      onRateUpdate?.(liveRate);
    }
  }, [liveRate, onRateUpdate]);

  // Track fee comparisons when calculations update
  useEffect(() => {
    if (summary.usdAmount > 0 && liveRate?.rate) {
      const paypalData = summary.competitorComparison.find(c => c.name.toLowerCase() === 'paypal');
      const bankData = summary.competitorComparison.find(c => c.name.toLowerCase() === 'bank');
      
      if (paypalData && bankData) {
        const paypalFee = (0.044 * summary.usdAmount + 0.30) * liveRate.rate;
        const bankMarkup = (liveRate.rate - bankData.rate) * summary.usdAmount;
        const karbonSavings = paypalFee + bankMarkup;
        
        trackFeeComparison(
          summary.usdAmount,
          paypalFee,
          bankMarkup,
          karbonSavings
        );
      }
    }
  }, [summary.usdAmount, summary.competitorComparison, liveRate]);

  const handleAmountChange = (amount: number) => {
    updateAmount(amount);
  };

  const handlePlatformFeeChange = (value: string) => {
    setPlatformFeePercent(value);
    const numValue = parseFloat(value) || 0;
    updatePlatformFee(numValue);
  };

  const handleBankRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateRate('bank', numValue);
  };

  const handlePaypalRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateRate('paypal', numValue);
  };

  const handleBankChargesChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setBankCharges(numValue);
  };

  if (!isClient) {
    return <KarbonFxWidgetSkeleton />;
  }

  const bankData = summary.competitorComparison.find(c => c.name.toLowerCase() === 'bank');
  const paypalData = summary.competitorComparison.find(c => c.name.toLowerCase() === 'paypal');
  const amountError = getErrorMessage('amount', summary.usdAmount);

  return (
    <div className={`karbon-fx-widget w-full max-w-5xl mx-auto bg-transparent overflow-hidden ${className}`}>
      <div className="pt-4 pb-4">
        <CurrencyInputSection
          value={summary.usdAmount}
          onChange={handleAmountChange}
          isLoading={loading.isLoading}
          error={amountError}
        />
      </div>

      <div className="bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-stretch">
          {/* First position: Karbon Card (unchanged) */}
          <KarbonCard
            recipientAmount={summary.netInr}
            exchangeRate={liveRate}
            platformFeePercent={platformFeePercent}
            platformFeeAmount={summary.platformFee.amount}
            onPlatformFeeChange={handlePlatformFeeChange}
          />

          {/* Second position: PayPal */}
          <CompetitorCard
            name="PayPal"
            icon={<PayPalIcon />}
            rate={paypalData?.rate || 0}
            liveRate={liveRate?.rate || 0}
            usdAmount={summary.usdAmount}
            karbonTotal={summary.netInr}
            onRateChange={handlePaypalRateChange}
            delay={0.2}
            isLoading={loading.isLoading}
            hasError={error.hasError}
          />

          {/* Third position: Bank - WITH bank charges props */}
          <CompetitorCard
            name="Bank"
            icon={<BankIcon />}
            rate={bankData?.rate || 0}
            liveRate={liveRate?.rate || 0}
            usdAmount={summary.usdAmount}
            karbonTotal={summary.netInr}
            onRateChange={handleBankRateChange}
            delay={0.3}
            isLoading={loading.isLoading}
            hasError={error.hasError}
            bankCharges={bankCharges}
            onBankChargesChange={handleBankChargesChange}
          />
        </div>
      </div>

      {/* Error display */}
      {error.hasError && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            {error.message} {liveRate?.source === 'fallback' && 'Using fallback exchange rates.'}
          </p>
        </div>
      )}
    </div>
  );
};

export const KarbonFxWidget: React.FC<KarbonFxWidgetProps> = (props) => (
  <ErrorBoundary>
    <KarbonFxWidgetInner {...props} />
  </ErrorBoundary>
);
