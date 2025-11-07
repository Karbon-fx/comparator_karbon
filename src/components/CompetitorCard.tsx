/**
 * Height-Matched Competitor Card Component - Matches Karbon card exactly
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateMarkupPerUsd, calculateTotalInr, calculateSavings, formatRate } from '@/lib/utils';
import { sanitizeRateOfferedInput } from '@/lib/inputSanitizers';
import { UI_TEXT } from '@/lib/constants';
import { trackTooltipView, trackRateChange, trackCardInteraction, trackProviderInteraction } from '@/lib/clarity';
import type { CompetitorCardProps } from '@/types';

export const CompetitorCard: React.FC<CompetitorCardProps> = ({
  name,
  icon,
  rate,
  liveRate,
  usdAmount,
  karbonTotal,
  onRateChange,
  delay,
  isLoading = false,
  hasError = false,
  className = '',
}) => {
  const isPayPal = useMemo(() => name?.toLowerCase().includes('paypal'), [name]);
  
  // Track previous rate for rate change detection
  const [previousRate, setPreviousRate] = useState(rate);

  // Track rate changes for banks only
  useEffect(() => {
    if (!isPayPal && previousRate !== rate && previousRate > 0 && rate > 0) {
      trackRateChange('bank', previousRate, rate, usdAmount);
    }
    setPreviousRate(rate);
  }, [rate, previousRate, isPayPal, usdAmount]);

  // PayPal fee calculation: 4.4% + $0.30 (transaction fee)
  const paypalTransactionFeeUsd = useMemo(() => {
    const amt = Number(usdAmount) || 0;
    return (0.044 * amt) + 0.30;
  }, [usdAmount]);

  const paypalTransactionFeeInr = useMemo(() => {
    const lr = Number(liveRate) || 0;
    return (Number.isFinite(paypalTransactionFeeUsd) ? paypalTransactionFeeUsd : 0) * lr;
  }, [paypalTransactionFeeUsd, liveRate]);

  // PayPal currency conversion fee: 4%
  const paypalConversionFeeUsd = useMemo(() => {
    const amt = Number(usdAmount) || 0;
    return 0.04 * amt;
  }, [usdAmount]);

  const paypalConversionFeeInr = useMemo(() => {
    const lr = Number(liveRate) || 0;
    return paypalConversionFeeUsd * lr;
  }, [paypalConversionFeeUsd, liveRate]);

  // Total PayPal fees
  const totalPaypalFeesInr = paypalTransactionFeeInr + paypalConversionFeeInr;

  // For PayPal: effective rate = liveRate, but total includes both fees
  // For Bank: use user-entered rate
  const displayRate = isPayPal ? liveRate : rate;

  // Calculate totals - LOGIC PRESERVED + Enhanced for PayPal
  let totalInr;
  if (isPayPal) {
    // PayPal: Start with live rate conversion, then subtract total fees
    const baseAmount = calculateTotalInr(usdAmount, liveRate);
    totalInr = baseAmount - totalPaypalFeesInr;
  } else {
    // Bank: Use standard calculation with user rate
    totalInr = calculateTotalInr(usdAmount, rate);
  }

  const savings = calculateSavings(karbonTotal, totalInr);

  // Bank markup calculation (unchanged) - LOGIC PRESERVED
  const bankMarkupPerUsd = calculateMarkupPerUsd(liveRate, rate);

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPayPal) return; // PayPal rate is API-derived
    const sanitizedValue = sanitizeRateOfferedInput(e.target.value);
    const numValue = parseFloat(sanitizedValue) || 0;
    
    // Track the rate input interaction
    trackProviderInteraction('bank', 'rate_input_change', {
      old_rate: rate,
      new_rate: numValue,
      usd_amount: usdAmount
    });
    
    onRateChange(sanitizedValue);
  };

  // Handle tooltip view tracking
  const handleTooltipView = () => {
    trackTooltipView(isPayPal ? 'paypal_fee' : 'bank_markup', usdAmount);
  };

  // Handle card interaction tracking
  const handleCardHover = () => {
    trackCardInteraction(isPayPal ? 'paypal' : 'bank', 'hover');
  };

  const handleCardClick = () => {
    trackCardInteraction(isPayPal ? 'paypal' : 'bank', 'click');
  };

  // Format numbers - CALCULATIONS PRESERVED
  const formattedTotal = !isNaN(totalInr) && totalInr > 0 ? totalInr.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) : '₹0.00';

  const formattedSavings = !isNaN(savings) && savings > 0 ? savings.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) : '0.00';

  // Markup/Fee display - Clean and aligned with comma separation
  const formattedBankMarkup = isNaN(bankMarkupPerUsd) ? '—' : `₹${bankMarkupPerUsd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedPaypalFee = `₹${totalPaypalFeesInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const markupLabel = isPayPal ? 'PayPal Fee' : UI_TEXT.LABELS.RATE_MARKUP;
  const markupValue = isPayPal ? formattedPaypalFee : formattedBankMarkup;
  const markupValueClass = isPayPal
    ? 'text-red-600'
    : (bankMarkupPerUsd > 0 ? 'text-red-600' : bankMarkupPerUsd < 0 ? 'text-green-600' : 'text-gray-600');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 hover:-translate-y-1 relative overflow-visible ${
        isLoading ? 'opacity-75' : ''
      } ${hasError ? 'border-red-300 bg-red-50' : ''} ${className}`}
      onMouseEnter={handleCardHover}
      onClick={handleCardClick}
    >
      {/* Header - Improved alignment */}
      <div className="flex items-center gap-3 mb-6 h-14">
        <div className={`w-14 h-14 ${hasError ? 'bg-red-100' : 'bg-gray-50'} rounded-full flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <h4 className="text-xl font-semibold text-gray-900 flex-1">{name}</h4>
        {isLoading && (
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Recipient Amount - Consistent spacing */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <p className="text-sm text-gray-600 mb-2 font-medium">{UI_TEXT.LABELS.RECIPIENT_GETS}</p>
        <div className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">
          {formattedTotal}
        </div>
      </div>

      {/* Details - Perfect alignment */}
      <div className="space-y-4 text-sm">
        {/* Exchange Rate Row - Aligned properly */}
        <div className="flex justify-between items-center min-h-[32px]">
          <span className="text-gray-600 font-medium flex-shrink-0">{UI_TEXT.LABELS.UPWORK_RATE}</span>
          <div className="flex-shrink-0 min-w-[112px] text-right">
            {isPayPal ? (
              <span className="font-medium text-gray-900 tabular-nums inline-block">
                {displayRate.toString()}
              </span>
            ) : (
              <input
                type="text"
                value={displayRate.toString()}
                onChange={handleRateChange}
                disabled={isLoading}
                className={`w-28 px-3 py-1 text-right font-medium text-gray-900 bg-gray-50 rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none tabular-nums disabled:opacity-50 transition-colors ${
                  hasError ? 'border-red-300 bg-red-50' : ''
                }`}
              />
            )}
          </div>
        </div>

        {/* Markup/Fee Row - Info icon next to values */}
        <div className="flex justify-between items-center min-h-[32px]">
          <div className="flex-shrink-0">
            <span className="text-gray-600 font-medium">
              {markupLabel}
            </span>
          </div>
          
          <div className="flex-shrink-0 min-w-[112px] text-right">
            <div className="flex items-center justify-end gap-1">
              <span className={`font-semibold tabular-nums ${markupValueClass}`}>
                {markupValue}
              </span>
            </div>
          </div>
        </div>

        {/* Provider Type Row - Consistent alignment */}
        <div className="flex justify-between items-center min-h-[24px]">
          <span className="text-gray-500 text-sm flex-shrink-0">Provider type</span>
          <span className="text-gray-500 text-sm font-medium flex-shrink-0">
            {isPayPal ? 'Digital provider' : 'Traditional'}
          </span>
        </div>
      </div>

      {/* Status indicator - Consistent positioning */}
      <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-full text-center mt-6">
        HIGHER COST
      </div>

      {/* Loss Section - Perfect alignment (now includes total PayPal fees) */}
      <div className="mt-4 bg-red-50 rounded-xl py-4 px-6 text-center border border-red-200">
        <p className="text-sm text-red-700 font-medium mb-1 leading-tight">
          {UI_TEXT.LABELS.YOU_LOSE_WITH} {name}
        </p>
        <div className="text-lg font-bold text-red-600 tabular-nums leading-tight">
          -₹{formattedSavings}
        </div>
      </div>

      {/* Footer - Consistent spacing */}
      <p className="text-center text-xs text-gray-500 mt-4 opacity-80 leading-relaxed">
        Switch to Karbon for better rates
      </p>

      {/* Error State - Preserved */}
      {hasError && (
        <div className="absolute inset-0 bg-red-50 rounded-2xl flex items-center justify-center">
          <p className="text-sm text-red-600">Unable to calculate comparison</p>
        </div>
      )}
    </motion.div>
  );
};
