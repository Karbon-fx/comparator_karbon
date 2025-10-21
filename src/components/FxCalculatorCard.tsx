"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { formatAsINR, cn } from '@/lib/utils';
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

export default function FxCalculatorCard() {
  const [usdAmount, setUsdAmount] = useState<number>(10000);
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [debouncedUsdAmount, setDebouncedUsdAmount] = useState(usdAmount);
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    const fetchLiveRate = async () => {
      try {
        const response = await fetch('/api/live-rate');
        const data = await response.json();
        if (data.rate) {
          setLiveRate(data.rate);
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

    return () => {
      clearTimeout(handler);
    };
  }, [usdAmount]);
  
  useEffect(() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      setDeliveryDate(date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
  }, []);

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

  const { totalInr, bankInr, cardInr } = useMemo(() => {
    const currentRate = Number(liveRate);
    const currentUsd = Number(debouncedUsdAmount);

    if (!Number.isFinite(currentRate) || !Number.isFinite(currentUsd)) {
      return { totalInr: 0, bankInr: 0, cardInr: 0 };
    }

    const calculatedTotalInr = currentUsd * currentRate;
    const calculatedBankInr = calculatedTotalInr * (1 - 0.015);
    const calculatedCardInr = calculatedTotalInr * (1 - 0.04);

    return {
      totalInr: calculatedTotalInr,
      bankInr: calculatedBankInr,
      cardInr: calculatedCardInr,
    };
  }, [debouncedUsdAmount, liveRate]);

  return (
    <div className="w-full max-w-md mx-auto bg-[#f4f6fa] rounded-2xl shadow-md p-6 font-sans">
      <div className="space-y-6">
        {/* Top Section */}
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

        {/* Middle Section */}
        <div className="flex items-center justify-center space-x-2 text-sm text-[#667085]">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Live Forex, 0 Margin</span>
          <span className="font-semibold text-[#101828]">
            ₹{liveRate ? liveRate.toFixed(4) : '...'}
          </span>
        </div>
        
        {/* Bottom Section */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div>
            <p className="text-sm text-[#667085]">You will receive</p>
            <p className="text-3xl font-semibold text-[#101828]">{formatAsINR(totalInr)}</p>
            <Badge className="mt-2 bg-[#F9F5FF] text-[#5b3bee] font-medium hover:bg-[#F4EBFF]">
              By {deliveryDate}, Within 24 hours
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#f4f6fa] rounded-md p-3">
              <p className="text-xs text-[#667085]">Banks</p>
              <p className="text-lg font-semibold text-[#101828]">{formatAsINR(bankInr)}</p>
              <p className="text-xs text-red-600">Pays 1.5% less ↓</p>
            </div>
            <div className="bg-[#f4f6fa] rounded-md p-3">
              <p className="text-xs text-[#667085]">Cards</p>
              <p className="text-lg font-semibold text-[#101828]">{formatAsINR(cardInr)}</p>
               <p className="text-xs text-red-600">Pays 4% less ↓</p>
            </div>
          </div>
           <p className="text-xs text-[#667085] text-center pt-2">You save 1-5% more compared to Banks & Cards</p>
        </div>
      </div>
    </div>
  );
}
