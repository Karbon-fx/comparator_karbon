/**
 * Responsive Currency Input Section - Adapts to screen size while matching card alignment
 */

import React from 'react';
import CurrencyInput from 'react-currency-input-field';
import { CURRENCY_LIMITS, UI_TEXT } from '@/lib/constants';

const USFlagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" width="28" height="18" className="rounded-sm">
    <path fill="#B22234" d="M0 0h20v12H0z"/>
    <path fill="#fff" d="M0 1h20v1H0zm0 2h20v1H0zm0 2h20v1H0zm0 2h20v1H0zm0 2h20v1H0z"/>
    <path fill="#3C3B6E" d="M0 0h10v6H0z"/>
    <path fill="#fff" d="M.4 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM3.6 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM5.2 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6.8 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM8.4 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM1.2 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2.8 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM4.4 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM7.6 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM.4 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM3.6 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM5.2 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6.8 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM8.4 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM1.2 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2.8 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM4.4 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM7.6 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4z"/>
  </svg>
);

interface CurrencyInputSectionProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export const CurrencyInputSection: React.FC<CurrencyInputSectionProps> = ({
  value,
  onChange,
  onBlur,
  isLoading = false,
  error,
  className = '',
}) => {
  const handleValueChange = (val: string | undefined) => {
    let numValue = parseFloat(val || '0');
    if (isNaN(numValue)) {
      numValue = 0;
    }

    if (numValue > CURRENCY_LIMITS.USD.MAX) {
      onChange(CURRENCY_LIMITS.USD.MAX);
    } else {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    if (value < CURRENCY_LIMITS.USD.MIN) onChange(CURRENCY_LIMITS.USD.MIN);
    if (value > CURRENCY_LIMITS.USD.MAX) onChange(CURRENCY_LIMITS.USD.MAX);
    onBlur?.();
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-4">
        {UI_TEXT.LABELS.YOUR_CLIENT_PAYS}
      </label>
      
      {/* Responsive input: full width on mobile, card-matched width on desktop */}
      <div 
        className={`flex items-center bg-white rounded-2xl border-2 transition-all duration-200 w-full md:w-[1024] ${
          error ? 'border-red-300' : 'border-gray-200 focus-within:border-blue-500'
        }`}
      >
        
        {/* Currency section - responsive padding */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-r border-gray-200">
          <USFlagIcon />
          <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">USD</span>
        </div>
        
        {/* Amount input - responsive text size */}
        <div className="flex-1 px-2 sm:px-3 md:px-4 py-3">
          <CurrencyInput
            id="usd-input"
            name="usd-amount"
            value={value}
            decimalsLimit={2}
            onValueChange={handleValueChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className="w-full text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-transparent border-0 outline-none focus:ring-0 tabular-nums disabled:opacity-50"
            placeholder="1,400"
            allowNegativeValue={false}
            maxLength={9}
            groupSeparator=","
            decimalSeparator="."
          />
        </div>
      </div>
      
      {/* Only show error message if there's an error */}
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};
