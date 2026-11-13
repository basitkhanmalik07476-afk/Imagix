import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MoveHorizontal } from 'lucide-react';
import sampleCameraUrl from '@/src/assets/images/hero_studio_camera_optimized.jpg';
import { canvasToBlobAsync } from '@/src/lib/image/codecs';
import { cn, computeSavings, formatBytes } from '@/src/lib/utils';

interface HeroSpecimenPreviewProps {
  onLoadSampleIntoWorkspace: (file: File) => Promise<void>;
}

const QUALITY_LEVELS = [60, 78, 90] as const;

export function HeroSpecimenPreview({
  onLoadSampleIntoWorkspace,
}: HeroSpecimenPreviewProps) {
  const [splitPos, setSplitPos] = useState(52);
  const [targetFormat, setTargetFormat] = useState<'webp' | 'jpg'>('webp');
  const [quality, setQuality] = useState<number>(78);
  const [originalBytes, setOriginalBytes] = useState<number>(0);
  const [compressedBytes, setCompressedBytes] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string>(sampleCameraUrl);
  const [dimensions, setDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [loadingSample, setLoadingSample] = useState(false);

  const sourceFileRef = useRef<File | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(sampleCameraUrl);
        const blob = await res.blob();
        if (!active) return;

        const file = new File([blob], 'rangefinder-studio-sample.jpg', {
          type: blob.type || 'image/jpeg',
        });
        sourceFileRef.current = file;
        setOriginalBytes(blob.size);

        const img = new Image();
        img.onload = () => {
          if (!active) return;
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            sourceCanvasRef.current = canvas;
            setDimensions({ w: canvas.width, h: canvas.height });
          }
        };
        img.src = sampleCameraUrl;
      } catch {
        // fallback remains static image
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let revoked = false;
    let currentUrl: string | null = null;

    (async () => {
      const canvas = sourceCanvasRef.current;
      if (!canvas) return;

      const mime = targetFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      try {
        const outBlob = await canvasToBlobAsync(canvas, mime, quality / 100);
        if (revoked) return;
        currentUrl = URL.createObjectURL(outBlob);
        setCompressedBytes(outBlob.size);
        setCompressedUrl(currentUrl);
      } catch {
        const fallbackBlob = await canvasToBlobAsync(canvas, 'image/jpeg', quality / 100);
        if (revoked) return;
        currentUrl = URL.createObjectURL(fallbackBlob);
        setCompressedBytes(fallbackBlob.size);
        setCompressedUrl(currentUrl);
      }
    })();

    return () => {
      revoked = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [targetFormat, quality, dimensions.w]);

  const updateSplit = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.max(4, Math.min(96, next)));
  };

  const savings =
    originalBytes > 0 && compressedBytes > 0
      ? computeSavings(originalBytes, compressedBytes)
      : null;

  const handleOpenInCompressor = async () => {
    if (!sourceFileRef.current) return;
    setLoadingSample(true);
    try {
      await onLoadSampleIntoWorkspace(sourceFileRef.current);
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#e6e1d6] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(20,35,28,0.12)]">
      {/* Top Frame Chrome matching reference card */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#f0ece3] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e57373]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e6b84d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2a9d74]" />
          </div>
          <span className="text-xs font-medium text-[#646862]">
            Studio Preview
            {dimensions.w > 0 ? ` · ${dimensions.w}×${dimensions.h}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex rounded-lg border border-[#e6e1d6] bg-[#faf8f3] p-0.5">
            {(['webp', 'jpg'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setTargetFormat(fmt)}
                className={cn(
                  'rounded-md px-2 py-0.5 font-mono text-[11px] font-medium uppercase cursor-pointer transition-colors',
                  targetFormat === fmt
                    ? 'bg-[#181a18] text-white'
                    : 'text-[#555955] hover:text-[#181a18]'
                )}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-[#e6e1d6] bg-[#faf8f3] p-0.5">
            {QUALITY_LEVELS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={cn(
                  'rounded-md px-2 py-0.5 font-mono text-[11px] tabular-nums font-medium cursor-pointer transition-colors',
                  quality === q
                    ? 'bg-[#0e7c5b] text-white'
                    : 'text-[#555955] hover:text-[#181a18]'
                )}
              >
                {q}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Split Viewport */}
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Live homepage compression comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(splitPos)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSplitPos((p) => Math.max(4, p - 4));
          if (e.key === 'ArrowRight') setSplitPos((p) => Math.min(96, p + 4));
        }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateSplit(e.clientX);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) updateSplit(e.clientX);
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            // ignore
          }
        }}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-[#e6e1d6] bg-[#f4f1ea] cursor-ew-resize touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
      >
        <img
          src={compressedUrl}
          alt="Rangefinder camera studio specimen compressed output"
          draggable={false}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />

        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
        >
          <img
            src={sampleCameraUrl}
            alt="Rangefinder camera studio specimen original"
            draggable={false}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="pointer-events-none absolute left-3 bottom-3 rounded-lg bg-[#181a18]/80 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-xs">
          Original {originalBytes > 0 ? `· ${formatBytes(originalBytes)}` : ''}
        </div>
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-lg bg-[#0e7c5b]/90 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-xs">
          {targetFormat.toUpperCase()} {quality}%{' '}
          {compressedBytes > 0 ? `· ${formatBytes(compressedBytes)}` : ''}
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.45)]"
          style={{ left: `${splitPos}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-8.5 w-8.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6e1d6] bg-white text-[#181a18] shadow-md">
            <MoveHorizontal className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Bottom Live Telemetry */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="font-mono text-xs tabular-nums text-[#555955]">
          {savings ? (
            savings.isSmaller ? (
              <span>
                Reduced by{' '}
                <strong className="font-semibold text-[#0e7c5b]">
                  {savings.percent.toFixed(1)}%
                </strong>{' '}
                ({formatBytes(savings.savedBytes)} saved)
              </span>
            ) : (
              <span>Output size: {formatBytes(compressedBytes)}</span>
            )
          ) : (
            <span>Encoding live preview...</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpenInCompressor}
          disabled={loadingSample || !sourceFileRef.current}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0e7c5b] hover:text-[#095e44] cursor-pointer disabled:opacity-50"
        >
          <span>{loadingSample ? 'Loading...' : 'Test sample in studio'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
