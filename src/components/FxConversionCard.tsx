
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRate, formatAsINR, toNumberSafe, calculateMarkup, calculateTotalInr, calculateSavings } from '@/lib/utils';
import { sanitizeRateOfferedInput, sanitizeUsdDisplay } from '@/lib/inputSanitizers';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ProviderId = 'bank' | 'paypal';

type ProviderRates = {
  [key in ProviderId]: string;
};

type RateError = {
  [key in ProviderId]?: string;
};

const UsdInput = ({ value, onChange, onBlur, error }: { value: string, onChange: (val: string) => void, onBlur: () => void, error?: string | null }) => {
  const handleStep = (direction: 'up' | 'down') => {
    const numericValue = sanitizeUsdDisplay(value).numeric;
    const step = 100;
    const newRawValue = direction === 'up' ? numericValue + step : numericValue - step;
    const clampedValue = Math.max(100, Math.min(100000, newRawValue));
    onChange(String(clampedValue));
  };

  return (
    <div>
      <label htmlFor="usd-amount" className="block text-sm font-medium text-gray-700 mb-2">Amount to Convert</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Image 
            src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
            alt="USD Flag"
            width={24}
            height={18}
            className="rounded-sm"
          />
          <span className="text-lg font-semibold text-gray-500 ml-2">$</span>
        </div>
        <input
          id="usd-amount"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full pl-20 pr-16 py-3 text-xl font-semibold text-karbon-primary bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-shadow"
          aria-label="USD amount to convert"
          inputMode="decimal"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button onClick={() => handleStep('down')} className="p-1 text-gray-500 hover:text-gray-800" aria-label="Decrease amount">-</button>
          <button onClick={() => handleStep('up')} className="p-1 text-gray-500 hover:text-gray-800" aria-label="Increase amount">+</button>
        </div>
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};


const ProviderRow = ({ provider, usdAmount, liveRate, karbonInr, onRateChange, onRateBlur, rateError, isHighlighted, bestSavings }: any) => {
  const { name, logo, rate, isEditable } = provider;

  const result = useMemo(() => {
    const safeUsd = toNumberSafe(usdAmount);
    const safeLiveRate = toNumberSafe(liveRate);
    const safeOfferedRate = toNumberSafe(rate);

    const totalInr = calculateTotalInr(safeUsd, safeOfferedRate);
    return {
      offeredRate: safeOfferedRate,
      markup: calculateMarkup(safeLiveRate, safeOfferedRate),
      totalInr: totalInr,
      savings: calculateSavings(karbonInr, totalInr),
    };
  }, [usdAmount, liveRate, rate, karbonInr]);

  const isBestSavings = result.savings > 0 && result.savings === bestSavings;

  return (
    <TableRow className={cn("transition-colors duration-500", isHighlighted && "bg-blue-100/50")}>
      <TableCell className="font-semibold text-karbon-primary flex items-center gap-3">
        {logo && <Image src={logo} alt={`${name} logo`} width={24} height={24} />}
        {name}
      </TableCell>
      <TableCell className="text-center tabular-nums text-primary font-medium">${new Intl.NumberFormat('en-US').format(usdAmount)}</TableCell>
      <TableCell className="text-center tabular-nums text-primary font-medium">{formatRate(liveRate)}</TableCell>
      <TableCell className="p-2 align-top w-40">
        {isEditable ? (
          <div>
            <input 
              type="text"
              value={rate ?? ''}
              onChange={(e) => onRateChange(e.target.value)}
              onBlur={onRateBlur}
              className={cn("text-center bg-white tabular-nums w-full rounded-md border px-3 py-2 text-sm transition-colors", rateError ? "border-danger focus:ring-danger/20" : "border-input focus:ring-karbon-accent/20", "focus:outline-none focus:ring-2")}
              inputMode="decimal"
              aria-label={`${name} offered rate`}
            />
            {rateError && <p className="text-xs text-danger mt-1 text-center">{rateError}</p>}
          </div>
        ) : (
          <div className="text-center font-semibold text-gray-800 tabular-nums p-3">{formatRate(result.offeredRate)}</div>
        )}
      </TableCell>
      <TableCell className={cn("text-center tabular-nums", Number.isFinite(result.markup) && result.markup > 0 ? 'text-danger' : 'text-gray-500')}>{formatRate(result.markup)}</TableCell>
      <TableCell className="text-center font-semibold text-lg text-gray-800 tabular-nums">{formatAsINR(result.totalInr)}</TableCell>
      <TableCell className={cn("text-center font-bold text-lg tabular-nums text-success", isBestSavings && "bg-cyan-100/50 ring-1 ring-cyan-400")}>{formatAsINR(result.savings)}</TableCell>
    </TableRow>
  );
};


export default function FxConversionCard() {
  const [usdAmount, setUsdAmount] = useState<number>(1000);
  const [usdDisplay, setUsdDisplay] = useState<string>('1,000');
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [debouncedUsdAmount, setDebouncedUsdAmount] = useState(usdAmount);
  
  const [providerRates, setProviderRates] = useState<ProviderRates>({
    bank: '85.1718',
    paypal: '85.3107',
  });

  const [debouncedProviderRates, setDebouncedProviderRates] = useState(providerRates);
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [rateErrors, setRateErrors] = useState<RateError>({});
  const [usdInputError, setUsdInputError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveRate = async () => {
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
    };
    fetchLiveRate();
  }, []);

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
  
  const handleProviderRateChange = (provider: ProviderId, value: string) => {
    const sanitizedValue = sanitizeRateOfferedInput(value);
    setProviderRates(prev => ({ ...prev, [provider]: sanitizedValue }));
    
    if (rateErrors[provider]) {
      setRateErrors(prev => ({ ...prev, [provider]: undefined }));
    }
    
    setHighlightedRow(provider);
    setTimeout(() => setHighlightedRow(null), 600);
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
      { id: 'karbon', name: 'Karbon (zero-markup)', logo: 'https://cdn.prod.website-files.com/670ceff4b2fa1be44c3929a5/67936f1eab8fdd86f27b9e5c_Karbon%20Card%20Logo%201.svg', rate: liveRate, isEditable: false },
      { id: 'bank', name: 'Bank', logo: 'https://placehold.co/24x24/7C859F/FFFFFF/png?text=B', rate: debouncedProviderRates.bank, isEditable: true },
      { id: 'paypal', name: 'PayPal', logo: 'https://placehold.co/24x24/0070BA/FFFFFF/png?text=P', rate: debouncedProviderRates.paypal, isEditable: true },
  ], [liveRate, debouncedProviderRates]);

  const allSavings = useMemo(() => {
    const bankSavings = calculateSavings(karbonInr, calculateTotalInr(debouncedUsdAmount, toNumberSafe(debouncedProviderRates.bank)));
    const paypalSavings = calculateSavings(karbonInr, calculateTotalInr(debouncedUsdAmount, toNumberSafe(debouncedProviderRates.paypal)));
    return [bankSavings, paypalSavings].filter(Number.isFinite);
  }, [karbonInr, debouncedUsdAmount, debouncedProviderRates]);
  
  const bestSavings = allSavings.length > 0 ? Math.max(0, ...allSavings) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto bg-card-bg rounded-2xl shadow-lg p-6 md:p-8 font-sans" style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius)' }}>
      <div className="space-y-6">
        <UsdInput value={usdDisplay} onChange={handleUsdChange} onBlur={handleUsdBlur} error={usdInputError} />

        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-gray-200">
                  <TableHead className="w-1/4 font-semibold text-left text-muted-foreground p-3">Provider</TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground p-3">Amount USD</TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground p-3">
                    <Tooltip>
                      <TooltipTrigger className="cursor-help underline decoration-dotted">Live Rate</TooltipTrigger>
                      <TooltipContent><p>Real-time market rate without any markup.</p></TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground p-3">Rate Offered</TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground p-3">
                     <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-dotted">Markup Value</TooltipTrigger>
                        <TooltipContent><p>liveRate - offeredRate</p></TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground p-3">Total INR</TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground p-3">Savings with Karbon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map(p => (
                   <ProviderRow 
                     key={p.id}
                     provider={p}
                     usdAmount={debouncedUsdAmount}
                     liveRate={liveRate}
                     karbonInr={karbonInr}
                     onRateChange={(value: string) => handleProviderRateChange(p.id as ProviderId, value)}
                     onRateBlur={() => handleRateBlur(p.id as ProviderId)}
                     rateError={rateErrors[p.id as ProviderId]}
                     isHighlighted={highlightedRow === p.id}
                     bestSavings={bestSavings}
                   />
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
        {lastUpdated && <div className="text-xs text-muted-foreground text-right mt-4">Live Rate as on {lastUpdated} <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span></div>}
      </div>
    </div>
  );
}
