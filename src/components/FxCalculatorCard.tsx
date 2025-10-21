"use client";

import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRate, toNumberSafe, calculateMarkup, calculateTotalInr, calculateSavings } from '@/lib/calculations';
import { cn, formatAsINR } from '@/lib/utils';
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

export default function FxCalculatorCard() {
  const [usdAmount, setUsdAmount] = useState<number>(1000);
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [debouncedUsdAmount, setDebouncedUsdAmount] = useState(usdAmount);
  
  const [providerRates, setProviderRates] = useState<ProviderRates>({
    bank: '85.1718',
    paypal: '85.3107',
  });
  const [debouncedProviderRates, setDebouncedProviderRates] = useState(providerRates);

  useEffect(() => {
    const fetchLiveRate = async () => {
      try {
        const response = await fetch('/api/live-rate');
        const data = await response.json();
        if (data.rate) {
          setLiveRate(data.rate);
          setLastUpdated(new Date(data.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
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
      setDebouncedProviderRates(providerRates);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [usdAmount, providerRates]);

  const handleSliderChange = (value: number[]) => {
    setUsdAmount(value[0]);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = Number(value.replace(/[^0-9.]/g, ''));
     if (Number.isFinite(numValue)) {
      setUsdAmount(numValue);
    }
  }

  const handleProviderRateChange = (provider: keyof ProviderRates, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
        setProviderRates(prev => ({ ...prev, [provider]: value }));
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


  return (
    <div className="w-full max-w-4xl mx-auto bg-[#f4f6fa] rounded-2xl shadow-md p-6 font-sans">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-[#667085] mb-2">Your client pays</p>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UsdFlag />
            </div>
            <input 
              type="text"
              value={`$ ${new Intl.NumberFormat('en-US').format(usdAmount)}`}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-2 text-2xl font-semibold text-[#101828] bg-white rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <Slider
            value={[usdAmount]}
            onValueChange={handleSliderChange}
            min={500}
            max={100000}
            step={500}
            className="mt-4"
          />
        </div>

        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4 font-semibold text-left text-[#101828]">Description</TableHead>
                        <TableHead className="text-center font-semibold text-[#101828]">Karbon (zero-markup)</TableHead>
                        <TableHead className="text-center font-semibold text-[#101828]">Bank</TableHead>
                        <TableHead className="text-center font-semibold text-[#101828]">PayPal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium text-[#667085]">Amount to be converted in USD</TableCell>
                        <TableCell className="text-center">${new Intl.NumberFormat('en-US').format(usdAmount)}</TableCell>
                        <TableCell className="text-center">${new Intl.NumberFormat('en-US').format(usdAmount)}</TableCell>
                        <TableCell className="text-center">${new Intl.NumberFormat('en-US').format(usdAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-[#667085]">Live Rates as on {lastUpdated || '...'}</TableCell>
                        <TableCell className="text-center">{formatRate(liveRate)}</TableCell>
                        <TableCell className="text-center">{formatRate(liveRate)}</TableCell>
                        <TableCell className="text-center">{formatRate(liveRate)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-[#667085]">Rate Offered</TableCell>
                        <TableCell className="text-center">{formatRate(karbon.offeredRate)}</TableCell>
                        <TableCell>
                            <Input 
                                type="text"
                                value={providerRates.bank ?? ''}
                                onChange={(e) => handleProviderRateChange('bank', e.target.value)}
                                className="text-center bg-white"
                                inputMode="decimal"
                            />
                        </TableCell>
                         <TableCell>
                            <Input 
                                type="text"
                                value={providerRates.paypal ?? ''}
                                onChange={(e) => handleProviderRateChange('paypal', e.target.value)}
                                className="text-center bg-white"
                                inputMode="decimal"
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-[#667085]">Markup</TableCell>
                        <TableCell className="text-center">0.0000</TableCell>
                        <TableCell className={cn("text-center", Number.isFinite(bank.markup) && bank.markup < 0 ? 'text-green-600' : 'text-red-600')}>{formatRate(bank.markup)}</TableCell>
                        <TableCell className={cn("text-center", Number.isFinite(paypal.markup) && paypal.markup < 0 ? 'text-green-600' : 'text-red-600')}>{formatRate(paypal.markup)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-[#667085]">Total INR received</TableCell>
                        <TableCell className="text-center font-bold">{formatAsINR(karbon.totalInr)}</TableCell>
                        <TableCell className="text-center">{formatAsINR(bank.totalInr)}</TableCell>
                        <TableCell className="text-center">{formatAsINR(paypal.totalInr)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium text-[#667085]">Savings with Karbon</TableCell>
                        <TableCell className="text-center font-bold text-green-600">{formatAsINR(0)}</TableCell>
                        <TableCell className="text-center font-bold text-green-600">{formatAsINR(bank.savings)}</TableCell>
                        <TableCell className="text-center font-bold text-green-600">{formatAsINR(paypal.savings)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
