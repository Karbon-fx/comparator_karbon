
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRate, formatAsINR, toNumberSafe, calculateTotalInr, calculateSavings, formatAsUSD, calculateMarkupPerUsd, calculateTotalMarkup } from '@/lib/utils';
import { sanitizeRateOfferedInput, sanitizeUsdDisplay } from '@/lib/inputSanitizers';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Info, Plus, Minus, RefreshCw, Clock } from 'lucide-react';

type ProviderId = 'bank' | 'paypal';

type ProviderRates = {
  [key in ProviderId]: string;
};

type RateError = {
  [key in ProviderId]?: string;
};

const UsdInput = ({ value, onChange, onBlur, onStep, error }: { value: string, onChange: (val: string) => void, onBlur: () => void, onStep: (direction: 'up' | 'down') => void, error?: string | null }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 sm:p-6 mb-6 border border-karbon-cornflower/30">
      <label htmlFor="usd-amount" className="block text-sm font-semibold text-karbon-ebony mb-3">
        Amount to Convert
      </label>
      
      <div className="flex items-center gap-2 sm:gap-4 bg-white rounded-lg p-3 sm:p-4 border-2 border-transparent focus-within:border-karbon-blue transition-colors">
        <div className="flex items-center gap-2 text-karbon-ebony">
          <Image 
            src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
            alt="USD Flag"
            width={28}
            height={21}
            className="rounded-sm"
          />
          <span className="text-lg font-semibold">$</span>
        </div>
        
        <input
          id="usd-amount"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="flex-1 text-2xl sm:text-3xl font-bold text-karbon-ebony bg-transparent border-0 focus:ring-0 tabular-nums p-0"
          placeholder="1,000"
          aria-label="USD amount to convert"
          inputMode="decimal"
        />
        
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => onStep('up')}
            className="w-8 h-8 rounded-md bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200"
            aria-label="Increase amount"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onStep('down')}
            className="w-8 h-8 rounded-md bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200"
            aria-label="Decrease amount"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const ProviderCard = ({ provider, usdAmount, liveRate, karbonInr, onRateChange, onRateBlur, rateError, isBestSavings }: any) => {
    const { id, name, logo, rate } = provider;
    const isKarbon = id === 'karbon';

    const result = useMemo(() => {
        const safeUsd = toNumberSafe(usdAmount);
        const safeOfferedRate = isKarbon ? liveRate : toNumberSafe(rate);
        const safeLiveRate = toNumberSafe(liveRate);

        if (isNaN(safeUsd) || isNaN(safeOfferedRate) || isNaN(safeLiveRate)) {
            return {
                offeredRate: safeOfferedRate,
                markupPerUsd: NaN,
                totalMarkup: NaN,
                totalInr: NaN,
                savings: NaN,
            };
        }

        const markupPerUsd = calculateMarkupPerUsd(safeLiveRate, safeOfferedRate);
        const totalMarkup = calculateTotalMarkup(markupPerUsd, safeUsd);
        const totalInr = calculateTotalInr(safeUsd, safeOfferedRate);
        
        const displayMarkupPerUsd = isKarbon ? 0 : markupPerUsd;

        return {
            offeredRate: safeOfferedRate,
            markupPerUsd: displayMarkupPerUsd,
            totalMarkup: isKarbon ? 0 : totalMarkup,
            totalInr: totalInr,
            savings: calculateSavings(karbonInr, totalInr),
        };
    }, [usdAmount, liveRate, rate, karbonInr, isKarbon]);

    const animatedTotalInr = useCountUp(result.totalInr);
    const animatedSavings = useCountUp(result.savings);
    
    return (
        <div className={cn(
            "relative rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300",
            "hover:shadow-lg hover:-translate-y-1",
            isKarbon 
              ? "bg-gradient-to-br from-blue-50 to-sky-100 border-karbon-blue shadow-lg shadow-blue-200/50"
              : "bg-white border-gray-200",
            isBestSavings && !isKarbon && "ring-2 ring-karbon-cornflower ring-offset-2"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    {logo}
                </div>
                <h3 className="font-semibold text-karbon-ebony text-lg">{name}</h3>
            </div>
             {isKarbon && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-karbon-blue text-white">
                    Zero Markup
                </span>
            )}
          </div>
    
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Recipient gets</p>
            <p className="text-2xl sm:text-3xl font-bold text-karbon-ebony tabular-nums tracking-tight">
              {formatAsINR(animatedTotalInr)}
            </p>
          </div>
    
          <div className="space-y-4 text-sm">
             <div className="flex justify-between items-center">
                <span className="text-gray-600">Exchange rate</span>
                {isKarbon ? (
                    <span className="font-medium text-karbon-ebony tabular-nums">{formatRate(result.offeredRate)}</span>
                ) : (
                     <div>
                        <input 
                            type="text"
                            value={rate ?? ''}
                            onChange={(e) => onRateChange(e.target.value)}
                            onBlur={onRateBlur}
                            className={cn("text-right bg-white tabular-nums w-24 rounded-md border px-2 py-1 text-sm transition-colors", rateError ? "border-danger focus:ring-danger/20" : "border-input focus:ring-karbon-accent/20", "focus:outline-none focus:ring-2")}
                            inputMode="decimal"
                            aria-label={`${name} offered rate`}
                        />
                        {rateError && <p className="text-xs text-danger mt-1 text-right">{rateError}</p>}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-1.5">
                Rate markup
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 cursor-help text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Difference from live rate per USD</p>
                  </TooltipContent>
                </Tooltip>
              </span>
              <span className={cn(
                "font-semibold tabular-nums",
                isKarbon ? "text-karbon-blue" : "text-red-600"
              )}>
                {isKarbon ? "₹0.00" : `₹${formatRate(result.markupPerUsd)}`}
              </span>
            </div>
    
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="font-semibold text-karbon-ebony">You send</span>
              <span className="font-bold text-karbon-ebony tabular-nums">{formatAsUSD(toNumberSafe(usdAmount))}</span>
            </div>
          </div>
          
          {!isKarbon && result.savings > 0 && (
             <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">You save with Karbon</p>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-success tabular-nums tracking-tight">
                        +{formatAsINR(animatedSavings)}
                    </p>
                    {isBestSavings && (
                       <span className="px-3 py-1 bg-karbon-cornflower text-white text-xs font-semibold rounded-full">
                         Best Alternative
                       </span>
                    )}
                </div>
            </div>
          )}
        </div>
      );
};

export default function FxConversionCard() {
  const [usdAmount, setUsdAmount] = useState<number>(1000);
  const [usdDisplay, setUsdDisplay] = useState<string>('1,000');
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [providerRates, setProviderRates] = useState<ProviderRates>({
    bank: '85.1718',
    paypal: '85.3107',
  });

  const [debouncedUsdAmount, setDebouncedUsdAmount] = useState(usdAmount);
  const [debouncedProviderRates, setDebouncedProviderRates] = useState(providerRates);

  const [rateErrors, setRateErrors] = useState<RateError>({});
  const [usdInputError, setUsdInputError] = useState<string | null>(null);

  const fetchLiveRate = useCallback(async () => {
    try {
      const response = await fetch('/api/live-rate');
      if (!response.ok) throw new Error('Failed to fetch live rate');
      const data = await response.json();
      if (data.rate) {
        setLiveRate(data.rate);
        setLastUpdated(new Date(data.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
      }
    } catch (error) {
      console.error('Failed to fetch live rate:', error);
    }
  }, []);

  useEffect(() => {
    fetchLiveRate();
  }, [fetchLiveRate]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveRate();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsdAmount(usdAmount);
    }, 150);
    return () => clearTimeout(handler);
  }, [usdAmount]);

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedProviderRates(providerRates);
    }, 200);
    return () => clearTimeout(handler);
  }, [providerRates]);

  const handleUsdChange = useCallback((value: string) => {
    const { display, numeric } = sanitizeUsdDisplay(value);
    setUsdDisplay(display);
    if (numeric > 100000) {
        setUsdAmount(100000);
        setUsdDisplay('100,000');
    } else {
        setUsdAmount(numeric);
    }
    setUsdInputError(null);
  }, []);

  const handleUsdBlur = useCallback(() => {
    let valueToClamp = usdAmount;
    if (valueToClamp === 0 && usdDisplay === '') {
        valueToClamp = 1000;
    }

    let clampedValue = valueToClamp;
    let error = null;
    if (clampedValue < 100) {
      clampedValue = 100;
      error = "Minimum is $100";
    } else if (clampedValue > 100000) {
      clampedValue = 100000;
      error = "Maximum is $100,000";
    }
    setUsdAmount(clampedValue);
    setUsdDisplay(new Intl.NumberFormat('en-US').format(clampedValue));
    setUsdInputError(error);
  }, [usdAmount, usdDisplay]);
  
  const handleUsdStep = useCallback((direction: 'up' | 'down') => {
    const step = 100;
    const newRawValue = direction === 'up' ? usdAmount + step : usdAmount - step;
    const clampedValue = Math.max(100, Math.min(100000, newRawValue));
    setUsdAmount(clampedValue);
    setUsdDisplay(new Intl.NumberFormat('en-US').format(clampedValue));
    setUsdInputError(null);
  }, [usdAmount]);

  const handleProviderRateChange = (provider: ProviderId, value: string) => {
    const sanitizedValue = sanitizeRateOfferedInput(value);
    setProviderRates(prev => ({ ...prev, [provider]: sanitizedValue }));
    
    if (rateErrors[provider]) {
      setRateErrors(prev => ({ ...prev, [provider]: undefined }));
    }
  };
  
  const handleRateBlur = (provider: ProviderId) => {
    const rate = providerRates[provider];
    if (rate === '' || !Number.isFinite(Number(rate))) {
      setRateErrors(prev => ({...prev, [provider]: 'A valid rate is required.'}));
    } else {
       setRateErrors(prev => ({...prev, [provider]: undefined}));
    }
  };

  const karbonInr = useMemo(() => {
      return calculateTotalInr(debouncedUsdAmount, liveRate ?? 0);
  }, [debouncedUsdAmount, liveRate]);

  const providers = useMemo(() => [
      { id: 'karbon', name: 'Karbon', logo: <Image src="https://cdn.prod.website-files.com/670ceff4b2fa1be44c3929a5/67936f1eab8fdd86f27b9e5c_Karbon%20Card%20Logo%201.svg" alt={`Karbon logo`} width={28} height={28} />, rate: liveRate },
      { id: 'bank', name: 'Bank', logo: <svg width="28" height="28" viewBox="0 0 100 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H16V40H0V0ZM40 12L50 4L60 12V16H40V12ZM42 18H58V20H42V18ZM42 22H58V24H42V22ZM38 28H62V32H38V28ZM36 34H64V38H36V34ZM66 0H81L100 40H85L81 28H70L66 40H51L66 0ZM78 22L76 16H74L72 22H78Z"/></svg>, rate: debouncedProviderRates.bank },
      { id: 'paypal', name: 'PayPal', logo: <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt={`PayPal logo`} width={24} height={24} />, rate: debouncedProviderRates.paypal },
  ], [liveRate, debouncedProviderRates]);

  const savingsResults = useMemo(() => {
    return providers.map(p => {
        if (p.id === 'karbon') return { id: p.id, savings: 0 };
        const providerInr = calculateTotalInr(debouncedUsdAmount, toNumberSafe(p.rate));
        return {
            id: p.id,
            savings: calculateSavings(karbonInr, providerInr)
        };
    });
  }, [karbonInr, debouncedUsdAmount, providers]);

  const bestSavings = Math.max(0, ...savingsResults.filter(r => r.id !== 'karbon').map(r => r.savings));
  const bestSavingsProviderId = savingsResults.find(r => r.savings === bestSavings)?.id;


  return (
    <div className="w-full max-w-7xl mx-auto bg-card-surface p-4 sm:p-6 font-sans">
      <div className="space-y-6">
        <UsdInput value={usdDisplay} onChange={handleUsdChange} onBlur={handleUsdBlur} onStep={handleUsdStep} error={usdInputError} />

        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-karbon-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-karbon-blue"></span>
            </span>
            {lastUpdated ? (
                <>
                <span className="font-medium text-karbon-ebony">Live Rate as on {lastUpdated}</span>
                <button onClick={handleManualRefresh} disabled={isRefreshing} aria-label="Refresh rates">
                    <RefreshCw className={cn("h-3 w-3 text-karbon-blue hover:text-karbon-accent", isRefreshing && "animate-spin")} />
                </button>
                </>
            ) : (
                <span>Fetching live rate...</span>
            )}
        </div>

        <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
                {providers.map(p => (
                   <ProviderCard 
                     key={p.id}
                     provider={p}
                     usdAmount={debouncedUsdAmount}
                     liveRate={liveRate}
                     karbonInr={karbonInr}
                     onRateChange={(value: string) => handleProviderRateChange(p.id as ProviderId, value)}
                     onRateBlur={() => handleRateBlur(p.id as ProviderId)}
                     rateError={rateErrors[p.id as ProviderId]}
                     isBestSavings={p.id !== 'karbon' && p.id === bestSavingsProviderId}
                   />
                ))}
            </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
