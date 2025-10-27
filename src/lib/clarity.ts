/**
 * Microsoft Clarity Custom Events - Enhanced Calculator Usage Tracking
 */

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

// Safe clarity caller - handles cases where clarity isn't loaded yet
const emit = (...args: any[]) => {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      window.clarity(...args);
    } catch (error) {
      console.warn('Clarity tracking error:', error);
    }
  }
};

// Enhanced amount tracking with more granular data
export const trackCalculatorAmount = (usdAmount: number) => {
  emit('event', 'calculator_amount_entered', {
    usd_amount: usdAmount,
    amount_range: getAmountRange(usdAmount),
    amount_tier: getAmountTier(usdAmount),
    timestamp: new Date().toISOString(),
  });
};

// Track provider interactions
export const trackProviderInteraction = (provider: 'paypal' | 'bank', action: string, data?: any) => {
  emit('event', 'provider_interaction', {
    provider,
    action,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Track rate changes specifically
export const trackRateChange = (provider: 'bank', oldRate: number, newRate: number, usdAmount: number) => {
  emit('event', 'rate_changed', {
    provider,
    old_rate: oldRate,
    new_rate: newRate,
    rate_difference: newRate - oldRate,
    usd_amount: usdAmount,
    amount_range: getAmountRange(usdAmount),
    timestamp: new Date().toISOString(),
  });
};

// Track tooltip views
export const trackTooltipView = (tooltipType: 'paypal_fee' | 'bank_markup', usdAmount: number) => {
  emit('event', 'tooltip_viewed', {
    tooltip_type: tooltipType,
    usd_amount: usdAmount,
    amount_range: getAmountRange(usdAmount),
    timestamp: new Date().toISOString(),
  });
};

// Track fee comparisons
export const trackFeeComparison = (usdAmount: number, paypalFee: number, bankMarkup: number, karbonSavings: number) => {
  emit('event', 'fee_comparison_calculated', {
    usd_amount: usdAmount,
    paypal_fee_inr: Math.round(paypalFee),
    bank_markup_inr: Math.round(bankMarkup),
    karbon_savings_inr: Math.round(karbonSavings),
    amount_range: getAmountRange(usdAmount),
    total_potential_savings: Math.round(paypalFee + bankMarkup),
    timestamp: new Date().toISOString(),
  });
};

// Enhanced Get Started tracking
export const trackGetStartedClick = (usdAmount: number, totalSavings: number, provider: string) => {
  emit('event', 'get_started_clicked', {
    usd_amount: usdAmount,
    total_potential_savings: Math.round(totalSavings),
    amount_range: getAmountRange(usdAmount),
    amount_tier: getAmountTier(usdAmount),
    comparison_provider: provider,
    timestamp: new Date().toISOString(),
  });
};

// Track card hover/focus events
export const trackCardInteraction = (cardType: 'karbon' | 'paypal' | 'bank', action: 'hover' | 'focus' | 'click') => {
  emit('event', 'card_interaction', {
    card_type: cardType,
    action,
    timestamp: new Date().toISOString(),
  });
};

// Helper function to categorize amounts
const getAmountRange = (amount: number): string => {
  if (amount <= 100) return '0-100';
  if (amount <= 500) return '101-500';
  if (amount <= 1000) return '501-1000';
  if (amount <= 5000) return '1001-5000';
  if (amount <= 10000) return '5001-10000';
  if (amount <= 50000) return '10001-50000';
  return '50000+';
};

// Helper function for business tiers
const getAmountTier = (amount: number): string => {
  if (amount <= 1000) return 'personal';
  if (amount <= 10000) return 'small_business';
  if (amount <= 50000) return 'medium_business';
  return 'enterprise';
};

// Session-level tracking
export const trackSessionStart = (initialAmount: number) => {
  emit('event', 'calculator_session_start', {
    initial_amount: initialAmount,
    amount_range: getAmountRange(initialAmount),
    amount_tier: getAmountTier(initialAmount),
    timestamp: new Date().toISOString(),
  });
};
