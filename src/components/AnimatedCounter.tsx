
"use client";
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  decimals?: number;
}

export const AnimatedCounter = ({ 
  value, 
  className = '', 
  prefix = '₹',
  decimals = 2 
}: AnimatedCounterProps) => {
  const spring = useSpring(0, { 
    mass: 0.8,
    stiffness: 75,
    damping: 15
  });
  
  const display = useTransform(spring, (latest) => {
     if (isNaN(latest)) return `${prefix}0.00`;
     return `${prefix}${latest.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
  });

  useEffect(() => {
    if (isNaN(value)) return;
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {display}
    </motion.span>
  );
};
