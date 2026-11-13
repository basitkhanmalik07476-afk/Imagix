import React, { useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { formatBytes } from '@/src/lib/utils';

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalLabel?: string;
  processedLabel?: string;
  originalSize: number;
  processedSize: number;
  alt: string;
}

export function BeforeAfterSlider({
  originalUrl,
  processedUrl,
  originalLabel = 'Original',
  processedLabel = 'Optimized',
  originalSize,
  processedSize,
  alt,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updatePosition = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, next)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#555955]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#181a18]">{originalLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatBytes(originalSize)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#0e7c5b]">{processedLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatBytes(processedSize)}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Before and after image comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 4));
          if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 4));
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="checkerboard-bg relative h-[320px] sm:h-[400px] w-full select-none overflow-hidden rounded-xl border border-[#e6e1d6] cursor-ew-resize touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
      >
        <img
          src={processedUrl}
          alt={`${alt} (${processedLabel})`}
          draggable={false}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        />

        <div
          className="checkerboard-bg absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={originalUrl}
            alt={`${alt} (${originalLabel})`}
            draggable={false}
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-[#181a18]/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
          {originalLabel}
        </div>
        <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-[#0e7c5b]/90 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
          {processedLabel}
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6e1d6] bg-white text-[#181a18] shadow-md">
            <MoveHorizontal className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
