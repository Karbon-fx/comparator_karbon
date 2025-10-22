
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
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_24_7655)"> <path d="M2.5874 9.66222C2.5874 9.66222 2.5874 9.66222 2.58897 9.65637C4.0175 4.32502 9.50114 1.15882 14.8328 2.58742C20.17 4.01754 23.336 9.5014 21.9075 14.8328C21.9059 14.8386 21.9059 14.8386 21.9059 14.8386C20.4773 20.1702 14.9936 23.3361 9.65635 21.906C4.32474 20.4774 1.1588 14.9938 2.5874 9.66222Z" fill="url(#paint0_radial_24_7655)"/> </g> <defs> <radialGradient id="paint0_radial_24_7655" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16.5059 19.7451) rotate(-117.444) scale(18.5589 18.5589)"> <stop stop-color="#F59314"/> <stop offset="0.557323" stop-color="#E54C1D"/> <stop offset="0.796911" stop-color="#CF3921"/> <stop offset="1" stop-color="#85271B"/> </radialGradient> <clipPath id="clip0_24_7655"> <rect width="20" height="20" fill="white" transform="translate(5.17638) rotate(15)"/> </clipPath> </defs> </svg>
);

const PayPalIcon = () => (
    <svg width="38" height="45" viewBox="0 0 38 45" fill="none" xmlns="http://www.w3.org/2000/svg"> <mask id="mask0_0_8" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="0" y="0" width="38" height="45"> <path d="M0 0H37.35V45H0V0Z" fill="white"/> </mask> <g mask="url(#mask0_0_8)"> <path d="M31.858 10.35C31.858 15.924 26.714 22.5 18.931 22.5H11.434L11.066 24.822L9.317 36H0L5.605 0H20.7C25.783 0 29.782 2.833 31.255 6.77C31.6798 7.91467 31.8844 9.12933 31.858 10.35Z" fill="#002991"/> <path d="M37.228 20.7C36.7307 23.7214 35.1744 26.4672 32.8376 28.446C30.5008 30.4248 27.5361 31.5074 24.474 31.5H19.268L17.101 45H7.834L9.317 36L11.067 24.822L11.434 22.5H18.931C26.704 22.5 31.858 15.924 31.858 10.35C35.683 12.324 37.913 16.313 37.228 20.7Z" fill="#60CDFF"/> <path d="M31.858 10.35C30.254 9.511 28.309 9 26.192 9H13.552L11.434 22.5H18.931C26.704 22.5 31.858 15.924 31.858 10.35Z" fill="#008CFF"/> </g> </svg>
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
        let numValue = parseFloat(value || '0');
        if (isNaN(numValue)) {
            numValue = 0;
        }

        if (numValue > 100000) {
            setUsdAmount(100000);
        } else {
            setUsdAmount(numValue);
        }
    };
    
    const handleUsdBlur = () => {
        if (usdAmount < 100) setUsdAmount(100);
        if (usdAmount > 100000) setUsdAmount(100000);
    };

    return (
        <div className="karbon-fx-widget w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            

            <div className="px-8 pt-8 pb-2 bg-gradient-to-br from-blue-50/50 to-sky-50/50">
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-karbon-ebony mb-3">
                        Your client pays
                    </label>
                    <div className="relative">
                        <div className="flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#0066CC] transition-all duration-200 px-6 py-4 shadow-sm">
                           <span className="text-4xl font-bold text-karbon-ebony mr-3">USD</span>
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
                                maxLength={6}
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

            </div>

            <div className="px-8 pb-8 bg-gradient-to-br from-blue-50/50 to-sky-50/50">
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
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-2">
                                <svg width="211" height="316" viewBox="0 0 211 316" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M86.7064 178.375L210.541 278.108L210.576 315.419L86.8342 315.534L86.7064 178.375ZM49.4969 0.0857278L49.7651 288.067L0.22231 238.89L0 0.131794L49.4969 0.0857278ZM209.243 68.6042L210.348 69.8293L210.5 233.264L111.433 154.354L209.243 68.6042ZM141.554 0L185.58 49.8828L86.6681 137.21L86.5407 0.0512382L141.554 0Z" fill="#0F71FF"/>
                                </svg>
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


