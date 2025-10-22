
import { useState, useEffect, useRef } from 'react';

// ease-out interpolator
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * A custom hook to animate a number counting up.
 * @param end - The target number to count up to.
 * @param duration - The duration of the animation in milliseconds.
 * @param decimals - The number of decimal places to use.
 * @returns The current animated value.
 */
export function useCountUp(end: number, duration = 400, decimals = 2): number {
  const [count, setCount] = useState(end);
  const startValueRef = useRef(end);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = startValueRef.current;
    
    // If the target is not a valid number, set it immediately without animation
    if (isNaN(end)) {
      setCount(NaN);
      return;
    }
    
    // If the value hasn't changed, do nothing.
    if (startValue === end) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentCount = startValue + (end - startValue) * easedProgress;
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure it ends on the exact value
        startValueRef.current = end;
      }
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Set the ref to the latest "end" value when the effect cleans up
      // This ensures the next animation starts from the correct place
      startValueRef.current = end; 
    };
  }, [end, duration, decimals]);

  return count;
}
