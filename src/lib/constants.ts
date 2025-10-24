/**
 * Application-wide constants for configuration and limits
 */

// Currency limits
export const CURRENCY_LIMITS = {
  USD: {
    MIN: 100,
    MAX: 100000,
    STEP: 100,
  },
  PLATFORM_FEE: {
    MIN: 0,
    MAX: 10,
    DEFAULT: 1.18,
  },
} as const;

// Default exchange rates (fallback values)
export const DEFAULT_RATES = {
  BANK: 85.1718,
  PAYPAL: 85.3107,
  LIVE_RATE_FALLBACK: 84.5000,
} as const;

// API Configuration
export const API_CONFIG = {
  LIVE_RATE_ENDPOINT: '/api/live-rate',
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds
} as const;

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DELAYS: {
    KARBON_CARD: 0.1,
    BANK_CARD: 0.2,
    PAYPAL_CARD: 0.3,
  },
  DECIMAL_PLACES: {
    RATE: 4,
    CURRENCY: 2,
  },
} as const;

// Validation patterns
export const VALIDATION = {
  RATE_REGEX: /^\d{1,3}(\.\d{1,4})?$/,
  AMOUNT_REGEX: /^\d{1,6}(\.\d{1,2})?$/,
} as const;