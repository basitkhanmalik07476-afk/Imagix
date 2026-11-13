import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function Slider({
  value,
  min = 1,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: SliderProps) {
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('relative flex w-full items-center py-2', className)}>
      <div className="relative h-2 w-full rounded-full bg-[#e6e1d6] overflow-hidden">
        <div
          className="h-full bg-[#0e7c5b] transition-[width] duration-75"
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <div
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#0e7c5b] bg-white shadow-sm"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}
