/**
 * Application-wide constants for configuration and limits
 */

// Currency limits and steps
export const CURRENCY_LIMITS = {
    USD: {
      MIN: 100,
      MAX: 100000,
      STEP: 100,
      DEFAULT: 1400,
    },
    PLATFORM_FEE: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 1.18,
      DECIMAL_PLACES: 2,
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
    MAX_RETRIES: 2,
    RETRY_DELAY_BASE: 1000, // Base delay for exponential backoff
  } as const;
  
  // UI Animation Configuration
  export const ANIMATION_CONFIG = {
    DELAYS: {
      KARBON_CARD: 0.1,
      BANK_CARD: 0.2,
      PAYPAL_CARD: 0.3,
    },
    DURATIONS: {
      HOVER_SCALE: 0.2,
      CARD_ENTRANCE: 0.3,
    },
    SCALES: {
      HOVER_UP: 1.03,
      HOVER_DOWN: 0.98,
      BUTTON_HOVER: 1.05,
      BUTTON_TAP: 0.95,
    },
  } as const;
  
  // Display Configuration
  export const DISPLAY_CONFIG = {
    DECIMAL_PLACES: {
      RATE: 4,
      CURRENCY: 2,
      PERCENTAGE: 2,
    },
    INPUT_LIMITS: {
      USD_MAX_LENGTH: 9,
      RATE_INTEGER_DIGITS: 3,
      RATE_DECIMAL_DIGITS: 4,
      PERCENTAGE_MAX_LENGTH: 5,
    },
    BREAKPOINTS: {
      SM: 640,
      MD: 768,
      LG: 1024,
    },
  } as const;
  
  // Validation Configuration
  export const VALIDATION_CONFIG = {
    PATTERNS: {
      RATE: /^\d{1,3}(\.\d{1,4})?$/,
      USD_AMOUNT: /^\d{1,6}(\.\d{1,2})?$/,
      PERCENTAGE: /^\d{1,2}(\.\d{1,2})?$/,
    },
    MESSAGES: {
      INVALID_RATE: 'Please enter a valid exchange rate',
      INVALID_AMOUNT: 'Please enter a valid USD amount',
      AMOUNT_TOO_LOW: `Minimum amount is $${CURRENCY_LIMITS.USD.MIN}`,
      AMOUNT_TOO_HIGH: `Maximum amount is $${CURRENCY_LIMITS.USD.MAX.toLocaleString()}`,
      RATE_FETCH_ERROR: 'Unable to fetch live rates. Using fallback data.',
      NETWORK_ERROR: 'Network error. Please check your connection.',
    },
  } as const;
  
  // UI Text Configuration
  export const UI_TEXT = {
    LABELS: {
      YOUR_CLIENT_PAYS: 'Your client pays',
      RECIPIENT_GETS: 'Recipient gets',
      EXCHANGE_RATE: 'Exchange rate',
      RATE_MARKUP: 'Rate markup',
      PLATFORM_FEE: 'Platform Fee',
      YOU_LOSE_WITH: 'You lose with',
      GET_STARTED: 'Get Started',
      ZERO_MARKUP: '✓ ZERO MARKUP',
      SIGN_UP_TEXT: 'Sign up in 2 minutes • No hidden fees',
    },
    TOOLTIPS: {
      RATE_MARKUP: 'Difference from live rate per USD',
      PLATFORM_FEE: '1% Platform Fee + 18% GST',
    },
    PLACEHOLDERS: {
      USD_AMOUNT: '1,400',
      PERCENTAGE: '0.00',
    },
  } as const;
  
  // External Links
  export const EXTERNAL_LINKS = {
    SIGNUP: 'https://karbonfx.com/signup-v2-form?utm_source=karbonccomparator',
    SECURITY_ATTRIBUTES: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  } as const;
  
  // Component Styling Constants
  export const STYLES = {
    COLORS: {
      KARBON_BLUE: '#0066CC',
      KARBON_EBONY: '#1a1a1a',
      SUCCESS_GREEN: '#10B981',
      DANGER_RED: '#EF4444',
      WARNING_ORANGE: '#F59E0B',
    },
    GRADIENTS: {
      KARBON_PRIMARY: 'from-[#0066CC] to-[#6495ED]',
    },
    SHADOWS: {
      CARD_HOVER: 'hover:-translate-y-1',
    },
    BORDERS: {
      DEFAULT: 'border-2 border-gray-200',
      FOCUS: 'focus:border-[#0066CC]',
    },
  } as const;
  
  // Development/Debug Configuration
  export const DEBUG_CONFIG = {
    ENABLE_CONSOLE_LOGS: process.env.NODE_ENV === 'development',
    SHOW_FALLBACK_INDICATORS: process.env.NODE_ENV === 'development',
    ENABLE_PERFORMANCE_MONITORING: true,
  } as const;
  