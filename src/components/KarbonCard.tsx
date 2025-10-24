/**
 * Karbon Card Component - Tooltips removed
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatRate } from '@/lib/utils';
import { 
  ANIMATION_CONFIG, 
  UI_TEXT, 
  EXTERNAL_LINKS, 
  CURRENCY_LIMITS 
} from '@/lib/constants';
import { sanitizePercentageInput } from '@/lib/inputSanitizers';
import type { ExchangeRateData } from '@/types';

const KarbonLogo = () => (
  <svg width="40" height="40" viewBox="0 0 211 316" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path fillRule="evenodd" clipRule="evenodd" d="M86.7064 178.375L210.541 278.108L210.576 315.419L86.8342 315.534L86.7064 178.375ZM49.4969 0.0857278L49.7651 288.067L0.22231 238.89L0 0.131794L49.4969 0.0857278ZM209.243 68.6042L210.348 69.8293L210.5 233.264L111.433 154.354L209.243 68.6042ZM141.554 0L185.58 49.8828L86.6681 137.21L86.5407 0.0512382L141.554 0Z" fill="#0066CC"/>
  </svg>
);

interface KarbonCardProps {
  recipientAmount: number;
  exchangeRate: ExchangeRateData | null;
  platformFeePercent: string;
  platformFeeAmount: number;
  onPlatformFeeChange: (value: string) => void;
  delay?: number;
  className?: string;
}

export const KarbonCard: React.FC<KarbonCardProps> = ({
  recipientAmount,
  exchangeRate,
  platformFeePercent,
  platformFeeAmount,
  onPlatformFeeChange,
  delay = ANIMATION_CONFIG.DELAYS.KARBON_CARD,
  className = '',
}) => {
  const handlePlatformFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizePercentageInput(e.target.value);
    onPlatformFeeChange(sanitizedValue);
  };

  const handlePlatformFeeBlur = () => {
    const num = parseFloat(platformFeePercent);
    if (isNaN(num) || num < CURRENCY_LIMITS.PLATFORM_FEE.MIN) {
      onPlatformFeeChange(CURRENCY_LIMITS.PLATFORM_FEE.MIN.toString());
    } else if (num > CURRENCY_LIMITS.PLATFORM_FEE.MAX) {
      onPlatformFeeChange(CURRENCY_LIMITS.PLATFORM_FEE.MAX.toString());
    }
  };

  // Ensure we have valid numbers to display
  const displayAmount = !isNaN(recipientAmount) && recipientAmount > 0 ? recipientAmount : 0;
  const displayRate = exchangeRate?.rate || 0;
  const isRateStale = exchangeRate?.isStale || exchangeRate?.source === 'fallback';

  // Format the recipient amount properly
  const formattedAmount = displayAmount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg ${className}`}
    >
      {/* Development indicator for stale rates */}
      {process.env.NODE_ENV === 'development' && isRateStale && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-medium">
          {exchangeRate?.source?.toUpperCase() || 'FALLBACK'}
        </div>
      )}

      {/* Header with logo and name */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-2 shadow-md">
          <KarbonLogo />
        </div>
        <h4 className="text-xl font-bold text-white">Karbon</h4>
      </div>

      {/* Recipient Amount Section */}
      <div className="mb-6 pb-6 border-b border-white/20">
        <p className="text-sm text-blue-100 mb-2 font-medium">
          {UI_TEXT.LABELS.RECIPIENT_GETS}
        </p>
        <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {formattedAmount}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-4 text-sm">
        {/* Exchange Rate */}
        <div className="flex justify-between items-center">
          <span className="text-blue-100 font-medium">
            {UI_TEXT.LABELS.EXCHANGE_RATE}
          </span>
          <span className="font-semibold text-white tabular-nums">
            {formatRate(displayRate)}
          </span>
        </div>

        {/* Platform Fee */}
        <div className="flex justify-between items-center">
          <span className="text-blue-100 font-medium">
            {UI_TEXT.LABELS.PLATFORM_FEE}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={platformFeePercent}
              onChange={handlePlatformFeeChange}
              onBlur={handlePlatformFeeBlur}
              className="w-16 px-2 py-1 text-right font-medium bg-white/20 text-white rounded border border-white/30 focus:border-white focus:ring-1 focus:ring-white focus:outline-none tabular-nums backdrop-blur-sm placeholder-white/50 transition-colors"
              placeholder="1.18"
              maxLength={5}
            />
            <span className="font-semibold text-white">%</span>
          </div>
        </div>

        {/* Fee Amount (if applicable) */}
        {platformFeeAmount > 0 && (
          <div className="flex justify-between items-center text-xs text-blue-100">
            <span>Fee amount</span>
            <span className="font-semibold tabular-nums">
              ₹{formatRate(platformFeeAmount, 2)}
            </span>
          </div>
        )}

        {/* Rate Markup (Always Zero for Karbon) */}
        <div className="flex justify-between items-center">
          <span className="text-blue-100 font-medium">
            {UI_TEXT.LABELS.RATE_MARKUP}
          </span>
          <span className="font-bold text-green-300 tabular-nums">₹0.00</span>
        </div>
      </div>

      {/* Zero Markup Badge */}
      <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full text-center mt-4 shadow-sm">
        {UI_TEXT.LABELS.ZERO_MARKUP}
      </div>

      {/* Call to Action Button */}
      <motion.a
        href={EXTERNAL_LINKS.SIGNUP}
        {...EXTERNAL_LINKS.SECURITY_ATTRIBUTES}
        className="block mt-6 w-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 rounded-xl"
        whileHover={{ scale: ANIMATION_CONFIG.SCALES.HOVER_UP }}
        whileTap={{ scale: ANIMATION_CONFIG.SCALES.HOVER_DOWN }}
        transition={{ duration: ANIMATION_CONFIG.DURATIONS.HOVER_SCALE }}
      >
        <div className="bg-white text-blue-600 rounded-xl py-4 px-6 text-center font-bold text-lg hover:bg-blue-50 transition-colors shadow-sm">
          {UI_TEXT.LABELS.GET_STARTED}
          <span className="ml-2">→</span>
        </div>
      </motion.a>

      {/* Footer Text */}
      <p className="text-center text-xs text-blue-100 mt-3 opacity-80">
        {UI_TEXT.LABELS.SIGN_UP_TEXT}
      </p>
    </motion.div>
  );
};
