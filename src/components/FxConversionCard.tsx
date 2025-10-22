"use client";

import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRate, formatAsINR, toNumberSafe, calculateMarkup, calculateTotalInr, calculateSavings } from '@/lib/utils';
import { sanitizeRateOfferedInput } from '@/lib/inputSanitizers';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const UsdFlag = () => (
  <Image 
    src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
    alt="USD Flag"
    width={24}
    height={24}
    className="rounded-full"
  />
);

type ProviderRates = {
    bank: string;
    paypal: string;
};

type RateError = {
    bank?: string;
    paypal?: string;
};

export default function FxConversionCard() {
  const [usdAmount, setUsdAmount] = useState<number>(1000);
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = Number(value.replace(/[^0-9]/g, ''));
    if (numValue > 100000) {
        setUsdAmount(100000);
    } else if (Number.isFinite(numValue)) {
      setUsdAmount(numValue);
    }
     setUsdInputError(null);
  }

  const handleInputBlur = () => {
    let clampedValue = usdAmount;
    let error = null;
    if (clampedValue < 100) {
      clampedValue = 100;
      error = "Minimum is $100";
    } else if (clampedValue > 100000) {
      clampedValue = 100000;
      error = "Maximum is $100,000";
    }
    setUsdAmount(clampedValue);
    setUsdInputError(error);
  };
  
  const handleProviderRateChange = (provider: keyof ProviderRates, value: string) => {
    const sanitizedValue = sanitizeRateOfferedInput(value);
    setProviderRates(prev => ({ ...prev, [provider]: sanitizedValue }));
    
    setHighlightedRow(provider);
    setTimeout(() => setHighlightedRow(null), 600);
  };
  
  const handleRateBlur = (provider: keyof ProviderRates) => {
    const rate = providerRates[provider];
    if (rate === '' || !Number.isFinite(Number(rate))) {
      setRateErrors(prev => ({...prev, [provider]: 'A valid rate is required.'}));
    } else {
       setRateErrors(prev => ({...prev, [provider]: undefined}));
    }
  };

  const { karbon, bank, paypal } = useMemo(() => {
    const safeUsd = toNumberSafe(debouncedUsdAmount);
    const safeLiveRate = toNumberSafe(liveRate);
    const safeBankRate = toNumberSafe(debouncedProviderRates.bank);
    const safePaypalRate = toNumberSafe(debouncedProviderRates.paypal);

    const karbonInr = calculateTotalInr(safeUsd, safeLiveRate);

    const bankResult = {
        offeredRate: safeBankRate,
        markup: calculateMarkup(safeLiveRate, safeBankRate),
        totalInr: calculateTotalInr(safeUsd, safeBankRate),
        savings: calculateSavings(karbonInr, calculateTotalInr(safeUsd, safeBankRate)),
    };
    
    const paypalResult = {
        offeredRate: safePaypalRate,
        markup: calculateMarkup(safeLiveRate, safePaypalRate),
        totalInr: calculateTotalInr(safeUsd, safePaypalRate),
        savings: calculateSavings(karbonInr, calculateTotalInr(safeUsd, safePaypalRate)),
    };

    return {
        karbon: {
            offeredRate: safeLiveRate,
            markup: 0,
            totalInr: karbonInr,
            savings: 0,
        },
        bank: bankResult,
        paypal: paypalResult,
    };
  }, [debouncedUsdAmount, liveRate, debouncedProviderRates]);

  const handleStep = (direction: 'up' | 'down') => {
    const step = 100;
    setUsdAmount(prev => {
        const newValue = direction === 'up' ? prev + step : prev - step;
        if (newValue > 100000) return 100000;
        if (newValue < 100) return 100;
        return newValue;
    });
    setUsdInputError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#f4f6fa] rounded-2xl shadow-lg p-6 md:p-8 font-sans">
      <div className="space-y-6">
        <div>
            <label htmlFor="usd-amount" className="text-sm text-muted-foreground mb-2 block">Amount to Convert</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none gap-2">
                    <UsdFlag />
                    <span className="text-lg font-semibold text-gray-500">$</span>
                </div>
                <input 
                    id="usd-amount"
                    type="text"
                    value={`${new Intl.NumberFormat('en-US').format(usdAmount)}`}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-full pl-16 pr-12 py-2 text-lg font-semibold text-[#101828] bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    aria-label="USD amount to convert"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button onClick={() => handleStep('down')} className="p-1 text-gray-500 hover:text-gray-800" aria-label="Decrease amount">-</button>
                    <button onClick={() => handleStep('up')} className="p-1 text-gray-500 hover:text-gray-800" aria-label="Increase amount">+</button>
                </div>
            </div>
          {usdInputError && <p className="text-xs text-red-600 mt-1">{usdInputError}</p>}
        </div>

        <div className="overflow-x-auto">
            <TooltipProvider>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-gray-200">
                            <TableHead className="w-1/4 font-semibold text-left text-muted-foreground p-2">Description</TableHead>
                            <TableHead className="text-center font-semibold text-[#145aff] p-2">Karbon (zero-markup)</TableHead>
                            <TableHead className="text-center font-semibold text-primary p-2">Bank</TableHead>
                            <TableHead className="text-center font-semibold text-primary p-2">PayPal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="odd:bg-white even:bg-slate-50 border-none">
                            <TableCell className="font-medium text-muted-foreground p-3">Amount USD</TableCell>
                            <TableCell className="text-center tabular-nums p-3 text-primary font-medium">${new Intl.NumberFormat('en-US').format(usdAmount)}</TableCell>
                            <TableCell className="text-center tabular-nums p-3 text-primary font-medium">${new Intl.NumberFormat('en-US').format(usdAmount)}</TableCell>
                            <TableCell className="text-center tabular-nums p-3 text-primary font-medium">${new Intl.NumberFormat('en-US').format(usdAmount)}</TableCell>
                        </TableRow>

                        <TableRow className="odd:bg-white even:bg-slate-50 border-none">
                            <TableCell className="font-medium text-muted-foreground p-3">Live Rate</TableCell>
                            <TableCell className="text-center tabular-nums p-3 text-primary font-medium">{formatRate(liveRate)}</TableCell>
                            <TableCell className="text-center tabular-nums p-3 text-primary font-medium">{formatRate(liveRate)}</TableCell>
                            <TableCell className="text-center tabular-nums p-3 text-primary font-medium">{formatRate(liveRate)}</TableCell>
                        </TableRow>
                        
                        <TableRow className="odd:bg-white even:bg-slate-50 border-y border-gray-200/80">
                            <TableCell className="font-medium text-muted-foreground p-3">Rate Offered</TableCell>
                            <TableCell className="text-center font-semibold text-gray-800 tabular-nums p-3">{formatRate(karbon.offeredRate)}</TableCell>
                            <TableCell className="p-2">
                                <input 
                                    type="text"
                                    value={providerRates.bank ?? ''}
                                    onChange={(e) => handleProviderRateChange('bank', e.target.value)}
                                    onBlur={() => handleRateBlur('bank')}
                                    className={cn("text-center bg-white tabular-nums w-full rounded-md border border-input px-3 py-2 text-sm", rateErrors.bank && "border-red-300 focus:ring-red-500/20")}
                                    inputMode="decimal"
                                    aria-label="Bank offered rate"
                                />
                                {rateErrors.bank && <p className="text-xs text-red-600 mt-1 text-center">{rateErrors.bank}</p>}
                            </TableCell>
                            <TableCell className="p-2">
                                <input 
                                    type="text"
                                    value={providerRates.paypal ?? ''}
                                    onChange={(e) => handleProviderRateChange('paypal', e.target.value)}
                                    onBlur={() => handleRateBlur('paypal')}
                                    className={cn("text-center bg-white tabular-nums w-full rounded-md border border-input px-3 py-2 text-sm", rateErrors.paypal && "border-red-300 focus:ring-red-500/20")}
                                    inputMode="decimal"
                                    aria-label="PayPal offered rate"
                                />
                                {rateErrors.paypal && <p className="text-xs text-red-600 mt-1 text-center">{rateErrors.paypal}</p>}
                            </TableCell>
                        </TableRow>

                        <TableRow className="odd:bg-white even:bg-slate-50 border-none">
                            <TableCell className="font-medium text-muted-foreground p-3">
                                <Tooltip>
                                    <TooltipTrigger className="cursor-help underline decoration-dotted">Markup Value</TooltipTrigger>
                                    <TooltipContent>liveRate - offeredRate</TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="text-center tabular-nums text-gray-500 p-3">0.0000</TableCell>
                            <TableCell className={cn("text-center tabular-nums transition-colors duration-500 p-3", Number.isFinite(bank.markup) && bank.markup < 0 ? 'text-green-600' : 'text-red-600', highlightedRow === 'bank' && 'bg-blue-100/50')}>{formatRate(bank.markup)}</TableCell>
                            <TableCell className={cn("text-center tabular-nums transition-colors duration-500 p-3", Number.isFinite(paypal.markup) && paypal.markup < 0 ? 'text-green-600' : 'text-red-600', highlightedRow === 'paypal' && 'bg-blue-100/50')}>{formatRate(paypal.markup)}</TableCell>
                        </TableRow>
                        
                        <TableRow className="border-t-2 border-gray-200 odd:bg-white even:bg-slate-50">
                            <TableCell className="font-semibold text-primary p-3 pt-5 text-base">Total INR</TableCell>
                            <TableCell className="text-center font-bold text-xl text-primary tabular-nums p-3 pt-5">{formatAsINR(karbon.totalInr)}</TableCell>
                            <TableCell className={cn("text-center font-semibold text-lg text-gray-800 tabular-nums transition-colors duration-500 p-3 pt-5", highlightedRow === 'bank' && 'bg-blue-100/50')}>{formatAsINR(bank.totalInr)}</TableCell>
                            <TableCell className={cn("text-center font-semibold text-lg text-gray-800 tabular-nums transition-colors duration-500 p-3 pt-5", highlightedRow === 'paypal' && 'bg-blue-100/50')}>{formatAsINR(paypal.totalInr)}</TableCell>
                        </TableRow>

                        <TableRow className="odd:bg-white even:bg-slate-50 border-none">
                            <TableCell className="font-semibold text-primary p-3 text-base">Savings Karbon</TableCell>
                            <TableCell className="text-center font-bold text-green-600 tabular-nums p-3 text-lg">{formatAsINR(0)}</TableCell>
                            <TableCell className={cn("text-center font-bold text-green-600 text-lg tabular-nums transition-colors duration-500 p-3", highlightedRow === 'bank' && 'bg-blue-100/50')}>{formatAsINR(bank.savings)}</TableCell>
                            <TableCell className={cn("text-center font-bold text-green-600 text-lg tabular-nums transition-colors duration-500 p-3", highlightedRow === 'paypal' && 'bg-blue-100/50')}>{formatAsINR(paypal.savings)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TooltipProvider>
        </div>
        {lastUpdated && <div className="text-xs text-gray-500 text-right mt-4">Live Rate as on {lastUpdated} <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span></div>}
      </div>
    </div>
  );
}
