/**
 * Centralized TypeScript interfaces and types for the application
 */

import { ReactNode } from 'react';

// ===== CORE DATA TYPES =====

export interface ExchangeRateData {
  rate: number;
  timestamp: string;
  source: 'api' | 'fallback' | 'cache';
  isStale?: boolean;
}

export interface CurrencyAmount {
  amount: number;
  currency: 'USD' | 'INR';
}

export interface CompetitorData {
  name: string;
  rate: number;
  markup: number;
  totalAmount: number;
  savings: number;
}

// ===== COMPONENT PROPS =====

export interface KarbonFxWidgetProps {
  initialAmount?: number;
  compact?: boolean;
  onAmountChange?: (amount: number) => void;
  onRateUpdate?: (rate: ExchangeRateData) => void;
  className?: string;
}

export interface CompetitorCardProps {
  name: string;
  icon: ReactNode;
  rate: number;
  liveRate: number;
  usdAmount: number;
  karbonTotal: number;
  onRateChange: (value: string) => void;
  delay: number;
  isLoading?: boolean;
  hasError?: boolean;
  className?: string;
}

export interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  decimalPlaces?: number;
}

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  currency: 'USD' | 'INR';
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

// ===== API TYPES =====

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface ExchangeRateApiResponse {
  rate: number;
  timestamp: string;
  base_currency: string;
  target_currency: string;
  provider: string;
}

export interface RateFetchOptions {
  timeout?: number;
  retries?: number;
  useCache?: boolean;
  fallbackToCache?: boolean;
}

// ===== CALCULATION TYPES =====

export interface CalculationResult {
  totalInr: number;
  markupPerUsd: number;
  totalMarkup: number;
  savings: number;
  isValid: boolean;
  error?: string;
}

export interface PlatformFee {
  percentage: number;
  amount: number;
  description: string;
}

export interface TransactionSummary {
  usdAmount: number;
  exchangeRate: number;
  grossInr: number;
  platformFee: PlatformFee;
  netInr: number;
  competitorComparison: CompetitorData[];
}

// ===== UI STATE TYPES =====

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
}

export interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ===== HOOK TYPES =====

export interface UseExchangeRateResult {
  rate: ExchangeRateData | null;
  loading: LoadingState;
  error: ErrorState;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export interface UseCalculationsResult {
  calculations: CalculationResult;
  summary: TransactionSummary;
  updateAmount: (amount: number) => void;
  updateRate: (provider: string, rate: number) => void;
  updatePlatformFee: (percentage: number) => void;
}

export interface UseValidationResult {
  validation: ValidationState;
  validateAmount: (amount: number) => boolean;
  validateRate: (rate: number) => boolean;
  validatePercentage: (percentage: number) => boolean;
  getErrorMessage: (field: string) => string | undefined;
}

// ===== CONFIGURATION TYPES =====

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  ui: {
    animationDuration: number;
    debounceMs: number;
    theme: 'light' | 'dark' | 'auto';
  };
  features: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enableCaching: boolean;
  };
}

// ===== UTILITY TYPES =====

export type CompetitorProvider = 'bank' | 'paypal';

export type CurrencyCode = 'USD' | 'INR';

export type AnimationDelay = number;

export type ValidationRule = {
  rule: (value: any) => boolean;
  message: string;
};

export type Formatter = {
  format: (value: number) => string;
  parse: (value: string) => number;
};

// ===== CONTEXT TYPES =====

export interface AppContextValue {
  config: AppConfig;
  exchangeRate: ExchangeRateData | null;
  loading: LoadingState;
  error: ErrorState;
  updateConfig: (config: Partial<AppConfig>) => void;
}

// ===== EVENT TYPES =====

export interface WidgetEventData {
  type: 'amount_change' | 'rate_update' | 'provider_change' | 'error';
  payload: any;
  timestamp: string;
}

export type EventHandler<T = any> = (data: T) => void;

// ===== FORM TYPES =====

export interface FormField {
  name: string;
  value: any;
  isValid: boolean;
  error?: string;
  touched: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: string[];
}

// ===== RESPONSIVE TYPES =====

export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export type ResponsiveValue<T> = T | {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};
