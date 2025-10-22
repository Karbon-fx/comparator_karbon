
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import CurrencyInput from 'react-currency-input-field';
import { Slider } from '@/components/ui/slider';
import { Info, RefreshCw, Plus, Minus, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateMarkupPerUsd, calculateSavings, calculateTotalInr, convertFromLogScale, convertToLogScale, formatRate, formatNumber } from '@/lib/utils';
import { sanitizeRateOfferedInput } from '@/lib/inputSanitizers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KarbonFxWidgetProps {
  initialAmount?: number;
  compact?: boolean;
}

interface AnimatedNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  decimals?: number;
}

const AnimatedNumber = ({ 
  value, 
  className = '', 
  prefix = '₹',
  decimals = 2 
}: AnimatedNumberProps) => {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    if (isNaN(latest)) return `${prefix}0.00`;
    return `${prefix}${latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  });
  const prevValue = useRef(0);

  useEffect(() => {
    if (isNaN(value)) return;
    const animation = animate(prevValue.current, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (latest) => {
        motionValue.set(latest);
      }
    });

    prevValue.current = value;

    return () => animation.stop();
  }, [value, motionValue]);

  return <motion.span className={className}>{rounded}</motion.span>;
};


const BankIcon = () => (
    <svg width="32" height="32" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0066CC" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-29.35 63.84h13.23v76.32h-13.23Zm20.48 33.35a39.31 39.31 0 0 1-5.32-1.29l2-12.06a28.14 28.14 0 0 0 4.1.86a11.52 11.52 0 0 0 7.26-1.92a7.68 7.68 0 0 0 2.76-6.11c0-4.63-2.43-7.23-7.29-9.15c-6-2.4-9.84-5.49-9.84-11.19a11.14 11.14 0 0 1 4-9.12a14.23 14.23 0 0 1 9.87-3.48a28.27 28.27 0 0 1 12.24 2.82l-3 11.45a19.64 19.64 0 0 0-8.64-2.4c-4.13 0-6.42 2.37-6.42 5.58c0 3.84 2.62 5.73 8.24 8.07c6.84 2.85 10.89 6.11 10.89 12.15a12.06 12.06 0 0 1-4.5 10.11a16.29 16.29 0 0 1-11.82 4.38Zm44 9.17a39.31 39.31 0 0 1-5.32-1.29l2-12.06a28.14 28.14 0 0 0 4.1.86a11.52 11.52 0 0 0 7.26-1.92a7.68 7.68 0 0 0 2.76-6.11c0-4.63-2.43-7.23-7.29-9.15c-6-2.4-9.84-5.49-9.84-11.19a11.14 11.14 0 0 1 4-9.12a14.23 14.23 0 0 1 9.87-3.48a28.27 28.27 0 0 1 12.24 2.82l-3 11.45a19.64 19.64 0 0 0-8.64-2.4c-4.13 0-6.42 2.37-6.42 5.58c0 3.84 2.62 5.73 8.24 8.07c6.84 2.85 10.89 6.11 10.89 12.15a12.06 12.06 0 0 1-4.5 10.11a16.29 16.29 0 0 1-11.82 4.38Z"/>
    </svg>
);

const PayPalIcon = () => (
    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt="PayPal" className="w-8 h-8" />
);


interface CompetitorCardProps {
    name: string;
    icon: React.ReactNode;
    rate: number;
    liveRate: number;
    usdAmount: number;
    karbonTotal: number;
    onRateChange: (value: string) => void;
    delay: number;
}

const CompetitorCard = ({ name, icon, rate, liveRate, usdAmount, karbonTotal, onRateChange, delay }: CompetitorCardProps) => {
    const markupPerUsd = calculateMarkupPerUsd(liveRate, rate);
    const totalInr = calculateTotalInr(usdAmount, rate);
    const savings = calculateSavings(karbonTotal, totalInr);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
                    {icon}
                </div>
                <h4 className="text-xl font-semibold text-karbon-ebony">{name}</h4>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Recipient gets</p>
                <AnimatedNumber
                    value={totalInr}
                    className="text-3xl font-bold text-karbon-ebony tabular-nums"
                />
            </div>

            <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Exchange rate</span>
                    <input
                        type="text"
                        value={rate}
                        onChange={(e) => onRateChange(sanitizeRateOfferedInput(e.target.value))}
                        className="w-24 px-2 py-1 text-right font-medium text-karbon-ebony bg-gray-50 rounded border border-gray-200 focus:border-karbon-blue focus:ring-1 focus:ring-karbon-blue tabular-nums"
                    />
                </div>
                <div className="flex justify-between items-center">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-gray-600 flex items-center gap-1 cursor-help">
                                    Rate markup
                                    <Info className="h-3 w-3 text-gray-400" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Difference from live rate per USD</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className="font-semibold text-red-600 tabular-nums">
                        ₹{formatRate(markupPerUsd)}
                    </span>
                </div>
            </div>

            {savings > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">You save with Karbon</p>
                    <AnimatedNumber
                        value={savings}
                        prefix="+₹"
                        className="text-2xl font-bold text-success tabular-nums"
                    />
                </div>
            )}
        </motion.div>
    );
};

export const KarbonFxWidget = ({ initialAmount = 1000, compact = false }: KarbonFxWidgetProps) => {
    const [usdAmount, setUsdAmount] = useState<number>(initialAmount);
    const [liveRate, setLiveRate] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [bankRate, setBankRate] = useState<string>('85.1718');
    const [paypalRate, setPaypalRate] = useState<string>('85.3107');

    const fetchLiveRate = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch('/api/live-rate');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            if (data.rate) {
                setLiveRate(data.rate);
                setLastUpdated(new Date(data.timestamp).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                }));
            }
        } catch (error) {
            console.error('Failed to fetch live rate:', error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        fetchLiveRate();
    }, []);

    const karbonTotalInr = useMemo(() => calculateTotalInr(usdAmount, liveRate || 0), [usdAmount, liveRate]);
    
    const handleUsdChange = (value: string | undefined) => {
        const numValue = parseFloat(value || '0');
        if (!isNaN(numValue)) {
            setUsdAmount(numValue);
        }
    };
    
    const handleUsdBlur = () => {
        if (usdAmount < 100) setUsdAmount(100);
        if (usdAmount > 100000) setUsdAmount(100000);
    };

    return (
        <div className="karbon-fx-widget w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            

            <div className="px-8 py-8 bg-gradient-to-br from-blue-50/50 to-sky-50/50">
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-karbon-ebony mb-3">
                        Amount to Convert
                    </label>
                    <div className="relative">
                        <div className="flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#0066CC] transition-all duration-200 px-6 py-4 shadow-sm">
                           <div className="flex items-center gap-3 mr-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-gray-200">
                                    <DollarSign className="h-6 w-6 text-[#0066CC]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500">USD</span>
                                    <span className="text-lg font-bold text-[#0C1A2B]">$</span>
                                </div>
                            </div>
                            <CurrencyInput
                                id="usd-input"
                                name="usd-amount"
                                value={usdAmount}
                                decimalsLimit={2}
                                onValueChange={handleUsdChange}
                                onBlur={handleUsdBlur}
                                className="flex-1 text-4xl font-bold text-karbon-ebony bg-transparent border-0 outline-none focus:ring-0 tabular-nums"
                                placeholder="1,000"
                                allowNegativeValue={false}
                            />
                            <div className="flex gap-2 ml-4">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setUsdAmount(Math.min(100000, usdAmount + 100))} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-[#0066CC] hover:text-white transition-colors flex items-center justify-center">
                                    <Plus className="h-5 w-5" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setUsdAmount(Math.max(100, usdAmount - 100))} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-[#0066CC] hover:text-white transition-colors flex items-center justify-center">
                                    <Minus className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative px-2">
                    <Slider
                        value={[convertToLogScale(usdAmount)]}
                        onValueChange={(value) => {
                            const linearValue = convertFromLogScale(value[0]);
                            setUsdAmount(Math.round(linearValue));
                        }}
                        min={convertToLogScale(100)}
                        max={convertToLogScale(100000)}
                        step={0.01}
                        className="mb-6"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        {[500, 2000, 10000, 50000, 100000].map(val => (
                             <motion.button
                                key={val}
                                whileHover={{ scale: 1.1, color: '#0066CC' }}
                                onClick={() => setUsdAmount(val)}
                                className="cursor-pointer hover:text-[#0066CC] transition-colors"
                            >
                                {val < 1000 ? `$${val}` : `$${val/1000}K`}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6 text-sm">
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="h-2 w-2 rounded-full bg-karbon-blue" />
                    <span className="font-medium text-karbon-ebony">
                        Live Rate as on {lastUpdated || 'Loading...'}
                    </span>
                    <motion.button whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={fetchLiveRate} disabled={isRefreshing} className="ml-2 p-1 rounded-md hover:bg-white transition-colors disabled:opacity-50">
                        <RefreshCw className={`h-4 w-4 text-karbon-blue ${isRefreshing ? 'animate-spin' : ''}`} />
                    </motion.button>
                </div>
            </div>

            <div className="px-8 py-8 bg-gray-50">
                <div className="text-center mb-8">
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative bg-gradient-to-br from-[#0066CC] to-[#6495ED] rounded-2xl p-6 text-white shadow-2xl shadow-blue-500/30 md:col-span-1 ring-4 ring-[#0066CC] ring-offset-4"
                    >
                        <div className="absolute -top-3 -right-3">
                            <div className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                                ✓ ZERO MARKUP
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                                <img src="/karbon-icon.svg" alt="Karbon" className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold">Karbon</h4>
                        </div>

                        <div className="mb-6 pb-6 border-b border-white/20">
                            <p className="text-sm text-blue-100 mb-2">Recipient gets</p>
                            <AnimatedNumber
                                value={karbonTotalInr}
                                className="text-4xl font-bold tabular-nums"
                            />
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-100">Exchange rate</span>
                                <span className="font-semibold tabular-nums">{formatRate(liveRate || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-100">Rate markup</span>
                                <span className="font-bold text-green-300 tabular-nums">₹0.00</span>
                            </div>
                        </div>
                    </motion.div>

                    <CompetitorCard
                        name="Bank"
                        icon={<BankIcon />}
                        rate={parseFloat(bankRate)}
                        liveRate={liveRate || 0}
                        usdAmount={usdAmount}
                        karbonTotal={karbonTotalInr}
                        onRateChange={setBankRate}
                        delay={0.2}
                    />

                    <CompetitorCard
                        name="PayPal"
                        icon={<PayPalIcon />}
                        rate={parseFloat(paypalRate)}
                        liveRate={liveRate || 0}
                        usdAmount={usdAmount}
                        karbonTotal={karbonTotalInr}
                        onRateChange={setPaypalRate}
                        delay={0.3}
                    />
                </div>
            </div>
        </div>
    );
};
