/**
 * Microsoft Clarity Custom Events - Track Calculator Usage
 */

declare global {
    interface Window {
      clarity: (...args: any[]) => void;
    }
  }
  
  export const trackCalculatorAmount = (usdAmount: number) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', 'calculator_amount_entered', {
        usd_amount: usdAmount,
        amount_range: getAmountRange(usdAmount),
        timestamp: new Date().toISOString(),
      });
    }
  };
  
  export const trackCalculatorInteraction = (action: string, data: any) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', `calculator_${action}`, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  };
  
  export const trackGetStartedClick = (usdAmount: number, savings: number) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', 'get_started_clicked', {
        usd_amount: usdAmount,
        total_potential_savings: Math.round(savings),
        amount_range: getAmountRange(usdAmount),
        timestamp: new Date().toISOString(),
      });
    }
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
  