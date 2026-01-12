import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setDirection(value > prevValueRef.current ? 'up' : 'down');
      setIsAnimating(true);
      
      // Update the display value after a short delay for exit animation
      const timer = setTimeout(() => {
        setDisplayValue(value);
        prevValueRef.current = value;
      }, 100);

      // Reset animation state
      const resetTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [value]);

  return (
    <span className={cn('relative inline-flex overflow-hidden', className)}>
      <span
        className={cn(
          'transition-all duration-200 ease-out',
          isAnimating && direction === 'up' && 'animate-slide-up',
          isAnimating && direction === 'down' && 'animate-slide-down'
        )}
      >
        {displayValue}
      </span>
    </span>
  );
}
