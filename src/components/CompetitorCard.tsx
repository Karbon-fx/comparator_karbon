/**
 * Height-Matched Competitor Card Component - Matches Karbon card exactly
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateMarkupPerUsd, calculateTotalInr, calculateSavings, formatRate } from '@/lib/utils';
import { sanitizeRateOfferedInput } from '@/lib/inputSanitizers';
import { UI_TEXT } from '@/lib/constants';
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
  const markupPerUsd = calculateMarkupPerUsd(liveRate, rate);
  const totalInr = calculateTotalInr(usdAmount, rate);
  const savings = calculateSavings(karbonTotal, totalInr);

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeRateOfferedInput(e.target.value);
    onRateChange(sanitizedValue);
  };

  // Format amounts
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
        isLoading ? 'opacity-75' : ''
      } ${hasError ? 'border-red-300 bg-red-50' : ''} ${className}`}
    >
      {/* Header - Same height as Karbon */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-14 h-14 ${hasError ? 'bg-red-100' : 'bg-gray-50'} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
        <h4 className="text-xl font-semibold text-gray-900">{name}</h4>
        {isLoading && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Recipient Amount - Same as Karbon */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <p className="text-sm text-gray-600 mb-2 font-medium">{UI_TEXT.LABELS.RECIPIENT_GETS}</p>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
          {formattedTotal}
        </div>
      </div>

      {/* Details Section - Match Karbon's spacing */}
      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">{UI_TEXT.LABELS.EXCHANGE_RATE}</span>
          <input
            type="text"
            value={rate.toString()}
            onChange={handleRateChange}
            disabled={isLoading}
            className={`w-24 px-3 py-1 text-right font-medium text-gray-900 bg-gray-50 rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none tabular-nums disabled:opacity-50 transition-colors ${
              hasError ? 'border-red-300 bg-red-50' : ''
            }`}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium flex items-center gap-1 cursor-help">
            {UI_TEXT.LABELS.RATE_MARKUP}
          </span>
          <span className={`font-semibold tabular-nums ${
            markupPerUsd > 0 ? 'text-red-600' : markupPerUsd < 0 ? 'text-green-600' : 'text-gray-600'
          }`}>
            {isNaN(markupPerUsd) ? '—' : `₹${formatRate(markupPerUsd)}`}
          </span>
        </div>

        {/* Extra spacing to match Karbon card height */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Provider type</span>
          <span className="text-gray-500 text-sm font-medium">Traditional</span>
        </div>
      </div>

      {/* Status indicator - matches Karbon's green badge position */}
      <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full text-center mt-4">
        HIGHER COST
      </div>

      {/* Loss Section - matches Karbon's button position */}
      <div className="mt-6 bg-red-50 rounded-xl py-4 px-6 text-center border border-red-200">
        <p className="text-sm text-red-700 font-medium mb-1">{UI_TEXT.LABELS.YOU_LOSE_WITH} {name}</p>
        <div className="text-lg font-bold text-red-600 tabular-nums">
          -₹{formattedSavings}
        </div>
      </div>

      {/* Footer text - matches Karbon's position */}
      <p className="text-center text-xs text-gray-500 mt-3 opacity-80">
        Switch to Karbon for better rates
      </p>

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-red-50 rounded-2xl flex items-center justify-center">
          <p className="text-sm text-red-600">Unable to calculate comparison</p>
        </div>
      )}
    </motion.div>
  );
};
