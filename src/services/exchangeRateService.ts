/**
 * Exchange Rate Service
 * Handles all external API calls for fetching live exchange rates with robust error handling
 */

import { API_CONFIG, DEFAULT_RATES } from '@/lib/constants';
import { 
  createRateFetchError, 
  createNetworkError, 
  createTimeoutError,
  CustomError 
} from '@/types/errors';
import type { ExchangeRateData, RateFetchOptions } from '@/types';

export interface ExchangeRateResponse {
  rate: number;
  timestamp: string;
  source: 'api' | 'fallback';
}

class ExchangeRateService {
  private cache: {
    data: ExchangeRateData | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0,
  };

  private listeners: Set<(rate: ExchangeRateData) => void> = new Set();

  /**
   * Subscribe to rate updates
   */
  subscribe(callback: (rate: ExchangeRateData) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers of rate updates
   */
  private notify(rate: ExchangeRateData): void {
    this.listeners.forEach(callback => {
      try {
        callback(rate);
      } catch (error) {
        console.error('Error in rate update callback:', error);
      }
    });
  }

  /**
   * Fetches live USD to INR exchange rate with caching and error handling
   */
  async fetchLiveRate(options: RateFetchOptions = {}): Promise<ExchangeRateData> {
    const { 
      timeout = API_CONFIG.REQUEST_TIMEOUT, 
      retries = API_CONFIG.MAX_RETRIES,
      useCache = true,
      fallbackToCache = true
    } = options;

    // Check cache first if enabled
    if (useCache) {
      const cachedRate = this.getCachedRate();
      if (cachedRate) {
        return cachedRate;
      }
    }

    // Attempt to fetch with retries
    let lastError: CustomError | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.makeRequest(timeout);
        
        // Cache successful response
        const now = Date.now();
        this.cache = {
          data: response,
          timestamp: now,
        };
        
        // Notify subscribers
        this.notify(response);
        
        return response;
      } catch (error) {
        lastError = error instanceof CustomError ? error : createRateFetchError(
          `Attempt ${attempt} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        
        if (attempt === retries) {
          console.warn(`All ${retries} attempts to fetch live rate failed:`, lastError);
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(
          API_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt - 1),
          10000 // Max 10 seconds
        );
        await this.delay(delay);
      }
    }

    // Try to use stale cache if available and fallback is enabled
    if (fallbackToCache && this.cache.data) {
      console.warn('Using stale cached data due to fetch failure');
      const staleData = {
        ...this.cache.data,
        isStale: true,
        source: 'cache' as const
      };
      this.notify(staleData);
      return staleData;
    }

    // Final fallback to default rate
    console.error('Using hardcoded fallback rate due to all failures');
    const fallbackRate = this.getFallbackRate();
    this.notify(fallbackRate);
    
    // Throw the last error for proper error handling
    if (lastError) {
      throw lastError;
    }

    return fallbackRate;
  }

  /**
   * Gets cached rate if still valid
   */
  private getCachedRate(): ExchangeRateData | null {
    const now = Date.now();
    if (this.cache.data && (now - this.cache.timestamp < API_CONFIG.CACHE_TTL)) {
      return this.cache.data;
    }
    return null;
  }

  /**
   * Makes the actual HTTP request to the exchange rate API
   */
  private async makeRequest(timeout: number): Promise<ExchangeRateData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(API_CONFIG.LIVE_RATE_ENDPOINT, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // Ignore JSON parsing errors for error data
        }

        throw createRateFetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, data: errorData },
          `Unable to fetch current exchange rates (${response.status})`
        );
      }

      const data = await response.json();
      
      // Validate response data
      if (!data.rate || typeof data.rate !== 'number' || data.rate <= 0) {
        throw createRateFetchError(
          'Invalid rate data received from API',
          data,
          'Received invalid exchange rate data'
        );
      }

      return {
        rate: data.rate,
        timestamp: data.timestamp || new Date().toISOString(),
        source: 'api',
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw createTimeoutError(
          `Request timeout after ${timeout}ms`,
          { timeout },
          'Request timed out. Please try again.'
        );
      }
      
      if (error instanceof CustomError) {
        throw error; // Re-throw custom errors
      }
      
      throw createNetworkError(
        'Failed to fetch exchange rate',
        error instanceof Error ? error.message : error,
        'Network error. Please check your connection.'
      );
    }
  }

  /**
   * Returns fallback rate when API is unavailable
   */
  private getFallbackRate(): ExchangeRateData {
    return {
      rate: DEFAULT_RATES.LIVE_RATE_FALLBACK,
      timestamp: new Date().toISOString(),
      source: 'fallback',
    };
  }

  /**
   * Utility function for adding delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clears the cache (useful for testing or forcing fresh data)
   */
  clearCache(): void {
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  /**
   * Gets the current cache status
   */
  getCacheInfo(): { cached: boolean; age: number; isStale: boolean } {
    const now = Date.now();
    const age = now - this.cache.timestamp;
    const isStale = age > API_CONFIG.CACHE_TTL;
    
    return {
      cached: this.cache.data !== null,
      age,
      isStale,
    };
  }

  /**
   * Preloads exchange rate data (useful for preemptive caching)
   */
  async preload(): Promise<void> {
    try {
      await this.fetchLiveRate({ useCache: false });
    } catch (error) {
      console.warn('Failed to preload exchange rate:', error);
    }
  }

  /**
   * Validates if a rate value is reasonable (basic sanity check)
   */
  isRateReasonable(rate: number): boolean {
    const MIN_REASONABLE_RATE = 60; // INR per USD
    const MAX_REASONABLE_RATE = 120; // INR per USD
    
    return rate >= MIN_REASONABLE_RATE && rate <= MAX_REASONABLE_RATE;
  }

  /**
   * Gets the age of the current cached data in milliseconds
   */
  getCacheAge(): number {
    return Date.now() - this.cache.timestamp;
  }

  /**
   * Forces a fresh fetch by clearing cache and fetching new data
   */
  async forceFresh(): Promise<ExchangeRateData> {
    this.clearCache();
    return this.fetchLiveRate({ useCache: false });
  }
}

// Export singleton instance
export const exchangeRateService = new ExchangeRateService();

// Export class for testing
export { ExchangeRateService };
