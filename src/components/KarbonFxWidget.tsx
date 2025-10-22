
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
    <svg width="28" height="28" viewBox="0 0 100 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-gray-600"><path d="M0 0H16V40H0V0ZM40 12L50 4L60 12V16H40V12ZM42 18H58V20H42V18ZM42 22H58V24H42V22ZM38 28H62V32H38V28ZM36 34H64V38H36V34ZM66 0H81L100 40H85L81 28H70L66 40H51L66 0ZM78 22L76 16H74L72 22H78Z" /></svg>
);

const PayPalIcon = () => (
     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.32422 4.10156L8.53125 4.09375C10.5938 4.09375 12.1836 4.41016 13.3008 5.04297C14.418 5.67578 15.1602 6.55078 15.5273 7.66797C15.8945 8.78516 15.6836 9.875 14.8945 10.9375C14.1055 12 12.9805 12.75 11.5176 13.1875C12.834 13.6172 13.8223 14.3945 14.4824 15.5195C15.1426 16.6445 15.3906 17.8984 15.2266 19.2812C15.0625 20.6641 14.4375 21.8438 13.3516 22.8203C12.2656 23.7969 10.9062 24.3633 9.27344 24.5273L3.32422 24.5195H3.32422ZM7.14844 6.82812V11.2344C7.14844 11.7578 7.35547 12.1641 7.76953 12.4531C8.18359 12.7422 8.68359 12.8867 9.26953 12.8867C9.85547 12.8867 10.3672 12.7227 10.8047 12.3945C11.2422 12.0664 11.5137 11.6094 11.6191 11.0234C11.7246 10.4375 11.6504 9.875 11.4082 9.33594C11.166 8.79688 10.7441 8.35547 10.1426 8.01172C9.54102 7.66797 8.77148 7.42578 7.83398 7.28516L7.14844 6.82812ZM7.15625 15.4141H8.57031C9.44531 15.4141 10.2188 15.543 10.8906 15.8008C11.5625 16.0586 12.1035 16.4297 12.5137 16.9141C12.9238 17.3984 13.1781 17.9648 13.2754 18.6133C13.3727 19.2617 13.3125 19.9297 13.0957 20.6172C12.8789 21.3047 12.502 21.8945 11.9648 22.3867C11.4277 22.8789 10.7637 23.2363 9.97266 23.459C9.18164 23.6816 8.35156 23.793 7.48242 23.793H7.15625V15.4141Z" fill="#253B80"/>
        <path d="M10.1602 0.882812L15.3672 0.875C17.4297 0.875 19.0195 1.19141 20.1367 1.82422C21.2539 2.45703 21.9961 3.33203 22.3633 4.44922C22.7305 5.56641 22.5195 6.65625 21.7305 7.71875C20.9414 8.78125 19.8164 9.53125 18.3535 9.96875C19.6699 10.3984 20.6582 11.1758 21.3184 12.3008C21.9785 13.4258 22.2266 14.6797 22.0625 16.0625C21.8984 17.4453 21.2734 18.625 20.1875 19.6016C19.1016 20.5781 17.7422 21.1445 16.1094 21.3086L10.1602 21.3008H10.1602ZM13.9844 3.60938V8.01562C13.9844 8.53906 14.1914 8.94531 14.6055 9.23438C15.0195 9.52344 15.5195 9.66797 16.1055 9.66797C16.6914 9.66797 17.2031 9.50391 17.6406 9.17578C18.0781 8.84766 18.3496 8.39062 18.4551 7.80469C18.5605 7.21875 18.4863 6.65625 18.2441 6.11719C18.002 5.57812 17.5801 5.13672 16.9785 4.79297C16.377 4.44922 15.6074 4.20703 14.6709 4.06641L13.9844 3.60938ZM13.9922 12.1953H15.4062C16.2812 12.1953 17.0547 12.3242 17.7266 12.582C18.3984 12.8398 18.9395 13.2109 19.3496 13.6953C19.7598 14.1797 20.0141 14.7461 20.1113 15.3945C20.2086 16.043 20.1484 16.7109 19.9316 17.3984C19.7148 18.0859 19.3379 18.6758 18.8008 19.168C18.2637 19.6602 17.5996 20.0176 16.8086 20.2402C16.0176 20.4629 15.1875 20.5742 14.3184 20.5742H13.9922V12.1953Z" fill="#179BD7"/>
    </svg>
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
            <div className="bg-gradient-to-r from-[#0066CC] to-[#6495ED] px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Currency Converter</h2>
                        <p className="text-blue-100 text-sm">Zero markup on exchange rates</p>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <img src="/karbon-logo.svg" alt="Karbon" className="w-12 h-12" />
                    </div>
                </div>
            </div>

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
                    <h3 className="text-2xl font-bold text-karbon-ebony mb-2">
                        See How Much You Save
                    </h3>
                    <p className="text-gray-600">
                        Karbon offers zero markup. Compare with other providers below.
                    </p>
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
