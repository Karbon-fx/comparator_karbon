
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencyInput from 'react-currency-input-field';
import { Info, Plus, Minus } from 'lucide-react';
import { calculateMarkupPerUsd, calculateSavings, calculateTotalInr, formatRate } from '@/lib/utils';
import { sanitizeRateOfferedInput } from '@/lib/inputSanitizers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedCounter } from '@/components/AnimatedCounter';


const BankIcon = () => (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_24_7655)">
            <path d="M2.5874 9.66222C2.5874 9.66222 2.5874 9.66222 2.58897 9.65637C4.0175 4.32502 9.50114 1.15882 14.8328 2.58742C20.17 4.01754 23.336 9.5014 21.9075 14.8328C21.9059 14.8386 21.9059 14.8386 21.9059 14.8386C20.4773 20.1702 14.9936 23.3361 9.65635 21.906C4.32474 20.4774 1.1588 14.9938 2.5874 9.66222Z" fill="url(#paint0_radial_24_7655)"/>
        </g>
        <defs>
            <radialGradient id="paint0_radial_24_7655" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16.5059 19.7451) rotate(-117.444) scale(18.5589 18.5589)">
                <stop stopColor="#F59314"/>
                <stop offset="0.557323" stopColor="#E54C1D"/>
                <stop offset="0.796911" stopColor="#CF3921"/>
                <stop offset="1" stopColor="#85271B"/>
            </radialGradient>
            <clipPath id="clip0_24_7655">
                <rect width="20" height="20" fill="white" transform="translate(5.17638) rotate(15)"/>
            </clipPath>
        </defs>
    </svg>
);

const PayPalIcon = () => (
    <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.2574 6.70833C20.2574 10.3208 16.9833 14.5833 11.9687 14.5833H7.21458L6.98333 16.0896L5.875 23.3333H0L3.53125 0H13.0625C16.2708 0 18.7917 1.83333 19.7292 4.38542C20.0035 5.12604 20.1345 5.91458 20.2574 6.70833Z" fill="#002991"/>
        <path d="M23.5 13.4167C23.1875 15.375 22.1875 17.1562 20.7292 18.4375C19.2708 19.7187 17.375 20.4167 15.4375 20.4167H12.1458L10.7917 29.1667H4.9375L5.875 23.3333L6.98333 16.0896L7.21458 14.5833H11.9687C16.9792 14.5833 20.2574 10.3208 20.2574 6.70833C22.5625 7.98958 23.9375 10.5833 23.5 13.4167Z" fill="#008CFF"/>
    </svg>
);

const USFlagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" width="36" height="24" className="rounded-sm shadow-md">
        <path fill="#B22234" d="M0 0h20v12H0z"/>
        <path fill="#fff" d="M0 1h20v1H0zm0 2h20v1H0zm0 2h20v1H0zm0 2h20v1H0zm0 2h20v1H0z"/>
        <path fill="#3C3B6E" d="M0 0h10v6H0z"/>
        <path fill="#fff" d="M.4 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM3.6 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM5.2 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6.8 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM8.4 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM1.2 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2.8 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM4.4 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM7.6 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM.4 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM3.6 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM5.2 2.1l.5-.3.L5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6.8 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM8.4 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM1.2 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2.8 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM4.4 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM7.6 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4z"/>
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
                <AnimatedCounter
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
                    <span className="font-semibold text-danger tabular-nums">
                        ₹{formatRate(markupPerUsd)}
                    </span>
                </div>
            </div>

            {savings > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="pt-6 border-t border-gray-200"
                >
                    <p className="text-sm text-gray-600 mb-2">You lose with {name}</p>
                    <AnimatedCounter
                        value={savings}
                        prefix="-₹"
                        className="text-2xl font-bold text-danger tabular-nums"
                    />
                </motion.div>
            )}
        </motion.div>
    );
};

export const KarbonFxWidget = ({ initialAmount = 1400, compact = false }: {initialAmount?: number; compact?: boolean;}) => {
    const [usdAmount, setUsdAmount] = useState<number>(initialAmount);
    const [liveRate, setLiveRate] = useState<number | null>(null);
    const [platformFeePercent, setPlatformFeePercent] = useState<string>('1.18');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchLiveRate();
    }, []);

    const [bankRate, setBankRate] = useState<string>('85.1718');
    const [paypalRate, setPaypalRate] = useState<string>('85.3107');

    const fetchLiveRate = async () => {
        try {
            const response = await fetch('/api/live-rate');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            if (data.rate) {
                setLiveRate(data.rate);
            }
        } catch (error) {
            console.error('Failed to fetch live rate:', error);
        }
    };
    
    const platformFeeAmount = useMemo(() => {
      const feePercent = parseFloat(platformFeePercent) || 0;
      const karbonTotal = calculateTotalInr(usdAmount, liveRate || 0);
      return (karbonTotal * feePercent) / 100;
    }, [platformFeePercent, usdAmount, liveRate]);

    const finalRecipientAmount = useMemo(() => {
      const karbonTotal = calculateTotalInr(usdAmount, liveRate || 0);
      return karbonTotal - platformFeeAmount;
    }, [usdAmount, liveRate, platformFeeAmount]);

    
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

    if (!isClient) {
        return <KarbonFxWidgetSkeleton />;
    }

    return (
        <div className="karbon-fx-widget w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-8 pt-10 pb-8">
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-karbon-ebony mb-3">
                        Your client pays
                    </label>
                    <div className="relative">
                        <div className="flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#0066CC] transition-all duration-200 px-6 py-4 shadow-sm">
                           <div className="flex items-center gap-3">
                             <USFlagIcon />
                             <span className="text-4xl font-bold text-karbon-ebony">USD</span>
                           </div>
                            <CurrencyInput
                                id="usd-input"
                                name="usd-amount"
                                value={usdAmount}
                                decimalsLimit={2}
                                onValueChange={handleUsdChange}
                                onBlur={handleUsdBlur}
                                className="flex-1 text-4xl font-bold text-karbon-ebony bg-transparent border-0 outline-none focus:ring-0 tabular-nums text-right pr-4"
                                placeholder="1,400"
                                allowNegativeValue={false}
                                maxLength={9}
                                groupSeparator=","
                                decimalSeparator="."
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

            <div className="px-8 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative bg-gradient-to-br from-[#0066CC] to-[#6495ED] rounded-2xl p-6 text-white shadow-2xl shadow-blue-500/30 md:col-span-1 ring-4 ring-[#0066CC] ring-offset-4"
                    >
                         <AnimatePresence>
                        <motion.div
                            className="absolute -top-3 -right-3"
                            initial={{ scale: 0, y: -10 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.5 }}
                        >
                            <div className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                                ✓ ZERO MARKUP
                            </div>
                        </motion.div>
                        </AnimatePresence>


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
                            <AnimatedCounter
                                value={finalRecipientAmount}
                                className="text-4xl font-bold tabular-nums"
                            />
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-100">Exchange rate</span>
                                <span className="font-semibold tabular-nums">{formatRate(liveRate || 0)}</span>
                            </div>
                           <div className="flex justify-between items-center">
                                <span className="text-blue-100 flex items-center gap-1">
                                    Platform Fee
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3 w-3 text-blue-200" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>1% Platform Fee + 18% GST</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </span>
                                <div className="flex items-center gap-2">
                                    <input
                                    type="text"
                                    value={platformFeePercent}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        const parts = value.split('.');
                                        if (parts.length <= 2 && (parts[1]?.length || 0) <= 2) {
                                        setPlatformFeePercent(value);
                                        }
                                    }}
                                    onBlur={() => {
                                        const num = parseFloat(platformFeePercent);
                                        if (isNaN(num) || num < 0) {
                                        setPlatformFeePercent('0');
                                        } else if (num > 10) {
                                        setPlatformFeePercent('10');
                                        }
                                    }}
                                    className="w-16 px-2 py-1 text-right font-medium bg-white/20 text-white rounded border border-white/30 focus:border-white focus:ring-1 focus:ring-white tabular-nums backdrop-blur-sm"
                                    placeholder="0.00"
                                    />
                                    <span className="font-semibold">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-100">Rate markup</span>
                                <span className="font-bold text-green-300 tabular-nums">₹0.00</span>
                            </div>
                        </div>
                        <motion.a
                            href="https://karbonfx.com/signup-v2-form?utm_source=karbonccomparator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-6 w-full"
                            whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-white text-[#0066CC] rounded-xl py-4 px-6 text-center font-bold text-lg shadow-lg hover:bg-opacity-95 transition-colors">
                            Get Started
                            <span className="ml-2">→</span>
                            </div>
                        </motion.a>

                        <p className="text-center text-xs text-blue-100 mt-3 opacity-80">
                            Sign up in 2 minutes • No hidden fees
                        </p>
                    </motion.div>

                    <CompetitorCard
                        name="Bank"
                        icon={<BankIcon />}
                        rate={parseFloat(bankRate)}
                        liveRate={liveRate || 0}
                        usdAmount={usdAmount}
                        karbonTotal={finalRecipientAmount}
                        onRateChange={setBankRate}
                        delay={0.2}
                    />

                    <CompetitorCard
                        name="PayPal"
                        icon={<PayPalIcon />}
                        rate={parseFloat(paypalRate)}
                        liveRate={liveRate || 0}
                        usdAmount={usdAmount}
                        karbonTotal={finalRecipientAmount}
                        onRateChange={setPaypalRate}
                        delay={0.3}
                    />
                </div>
            </div>
        </div>
    );
};

const KarbonFxWidgetSkeleton = () => {
    return (
        <div className="karbon-fx-widget w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="px-8 pt-10 pb-8">
                <div className="mb-4">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                    <div className="h-20 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
            <div className="px-8 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`rounded-2xl p-6 ${i === 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
                                <div className="h-6 w-24 bg-gray-300 rounded"></div>
                            </div>
                            <div className="mb-6 pb-6 border-b border-gray-300">
                                <div className="h-4 w-20 bg-gray-300 rounded mb-2"></div>
                                <div className="h-10 w-32 bg-gray-300 rounded"></div>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <div className="h-5 w-24 bg-gray-300 rounded"></div>
                                    <div className="h-8 w-20 bg-gray-300 rounded"></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="h-5 w-20 bg-gray-300 rounded"></div>
                                    <div className="h-5 w-16 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
    

    
    
