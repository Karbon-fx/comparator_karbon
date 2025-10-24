/**
 * Custom hook for form validation logic
 */

import { useMemo, useCallback } from 'react';
import { CURRENCY_LIMITS, VALIDATION_CONFIG } from '@/lib/constants';
import { validateInputFormat } from '@/lib/inputSanitizers';
import type { UseValidationResult, ValidationState } from '@/types';

export const useValidation = (): UseValidationResult => {
  const validateAmount = useCallback((amount: number): boolean => {
    return !isNaN(amount) && 
           amount >= CURRENCY_LIMITS.USD.MIN && 
           amount <= CURRENCY_LIMITS.USD.MAX;
  }, []);

  const validateRate = useCallback((rate: number): boolean => {
    return !isNaN(rate) && rate > 0 && rate < 200; // Reasonable exchange rate bounds
  }, []);

  const validatePercentage = useCallback((percentage: number): boolean => {
    return !isNaN(percentage) && 
           percentage >= CURRENCY_LIMITS.PLATFORM_FEE.MIN && 
           percentage <= CURRENCY_LIMITS.PLATFORM_FEE.MAX;
  }, []);

  const getErrorMessage = useCallback((field: string, value?: any): string | undefined => {
    switch (field) {
      case 'amount':
        if (!validateAmount(value)) {
          if (isNaN(value)) return 'Please enter a valid amount';
          if (value < CURRENCY_LIMITS.USD.MIN) return VALIDATION_CONFIG.MESSAGES.AMOUNT_TOO_LOW;
          if (value > CURRENCY_LIMITS.USD.MAX) return VALIDATION_CONFIG.MESSAGES.AMOUNT_TOO_HIGH;
        }
        break;
      case 'rate':
        if (!validateRate(value)) {
          return VALIDATION_CONFIG.MESSAGES.INVALID_RATE;
        }
        break;
      case 'percentage':
        if (!validatePercentage(value)) {
          return 'Please enter a valid percentage (0-10%)';
        }
        break;
      default:
        return undefined;
    }
    return undefined;
  }, [validateAmount, validateRate, validatePercentage]);

  const validation: ValidationState = useMemo(() => ({
    isValid: true,
    errors: [],
  }), []);

  return {
    validation,
    validateAmount,
    validateRate,
    validatePercentage,
    getErrorMessage,
  };
};
