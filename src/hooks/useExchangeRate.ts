/**
 * Custom hook for managing exchange rate data and API calls
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { exchangeRateService } from '@/services/exchangeRateService';
import { DEFAULT_RATES } from '@/lib/constants';
import type { ExchangeRateData, UseExchangeRateResult, LoadingState, ErrorState } from '@/types';
import { CustomError, ErrorType } from '@/types/errors';

export const useExchangeRate = (
  autoFetch: boolean = true,
  refetchInterval?: number
): UseExchangeRateResult => {
  const [rate, setRate] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [error, setError] = useState<ErrorState>({ hasError: false });
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const fetchRate = useCallback(async (showLoading = true) => {
    if (!isMountedRef.current) return;

    try {
      if (showLoading) {
        setLoading({ isLoading: true, message: 'Fetching exchange rates...' });
      }
      setError({ hasError: false });

      const rateData = await exchangeRateService.fetchLiveRate();
      
      if (!isMountedRef.current) return;

      setRate(rateData);
      setLoading({ isLoading: false });
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof CustomError ? err : new CustomError(
        ErrorType.RATE_FETCH_ERROR,
        'Failed to fetch exchange rate',
        undefined,
        err
      );

      setError({ 
        hasError: true, 
        error, 
        message: error.getUserFriendlyMessage() 
      });
      setLoading({ isLoading: false });

      // Set fallback rate on error
      setRate({
        rate: DEFAULT_RATES.LIVE_RATE_FALLBACK,
        timestamp: new Date().toISOString(),
        source: 'fallback',
      });
    }
  }, []);

  const refetch = useCallback(() => fetchRate(true), [fetchRate]);
  
  const clearCache = useCallback(() => {
    exchangeRateService.clearCache();
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchRate();
    }
  }, [autoFetch, fetchRate]);

  // Set up interval for periodic updates
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchRate(false); // Don't show loading for background updates
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, fetchRate]);

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = exchangeRateService.subscribe((newRate) => {
      if (isMountedRef.current) {
        setRate(newRate);
      }
    });

    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    rate,
    loading,
    error,
    refetch,
    clearCache,
  };
};
